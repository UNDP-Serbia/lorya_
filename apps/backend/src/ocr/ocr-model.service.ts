import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { OcrModelRepository } from './ocr-model.repository'
import { OcrModelEntity } from './ocr-model.entity'
import { OcrModelType } from './types/ocr-model-type.enum'
import { CreateOcrModelDto, OcrModelDto, UpdateOcrModelDto } from './dto'
import { ModelFilesService } from 'src/common/services/model-files.service'
import { LLM_RUNNER_SCRIPT } from 'src/llm/llm.constants'
import {
  parseLlmConfig,
  prepareLlmConfigFile,
  sanitizeLlmConfig,
} from 'src/llm/llm-config'

const CATEGORY = 'ocr'

interface UploadedFiles {
  configFile?: Express.Multer.File
  inputMapperFile?: Express.Multer.File
  outputMapperFile?: Express.Multer.File
}

@Injectable()
export class OcrModelService {
  private readonly logger = new Logger(OcrModelService.name)

  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly repository: OcrModelRepository,
    private readonly modelFiles: ModelFilesService
  ) {}

  async list(): Promise<OcrModelDto[]> {
    const entities = await this.repository.findAll()
    const dtos = this.mapper.mapArray(entities, OcrModelEntity, OcrModelDto)
    await Promise.all(entities.map((e, i) => this.attachLlmConfig(e, dtos[i])))
    return dtos
  }

  async findById(id: string): Promise<OcrModelDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new NotFoundException('Model not found')
    const dto = this.mapper.map(entity, OcrModelEntity, OcrModelDto)
    await this.attachLlmConfig(entity, dto)
    return dto
  }

  private async attachLlmConfig(
    entity: OcrModelEntity,
    dto: OcrModelDto
  ): Promise<void> {
    if (entity.type !== OcrModelType.LITELLM || !entity.configFilePath) return
    try {
      const cfg = parseLlmConfig(
        await this.modelFiles.readText(entity.configFilePath)
      )
      dto.llmConfig = sanitizeLlmConfig(cfg)
    } catch (err) {
      // Leave llmConfig undefined if the config file is missing/unreadable or
      // malformed; log it since write-time validation should prevent this.
      this.logger.warn(
        `Failed to load LLM config for model ${entity.id}: ${(err as Error).message}`
      )
    }
  }

  async create(
    dto: CreateOcrModelDto,
    files: UploadedFiles,
    uploadedById: string
  ): Promise<OcrModelDto> {
    const existing = await this.repository.findByName(dto.name)
    if (existing) {
      throw new ConflictException(
        `Model with name "${dto.name}" already exists`
      )
    }

    if (dto.isLlm) {
      return this.createLlmModel(dto, files, uploadedById)
    }

    this.assertAllFilesPresent(files)

    const created = await this.repository.create({
      name: dto.name,
      description: dto.description ?? null,
      type: OcrModelType.HUGGINGFACE,
      reference: dto.huggingfaceId,
      uploadedById,
    })

    try {
      const configFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        created.id,
        'config',
        files.configFile!
      )
      const inputMapperFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        created.id,
        'input-mapper',
        files.inputMapperFile!
      )
      const outputMapperFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        created.id,
        'output-mapper',
        files.outputMapperFile!
      )

      await this.repository.update(created.id, {
        configFilePath,
        inputMapperFilePath,
        outputMapperFilePath,
      })
    } catch (err) {
      await this.modelFiles.deleteModelDirectory(CATEGORY, created.id)
      await this.repository.delete(created.id)
      throw err
    }

    return this.findById(created.id)
  }

  private async createLlmModel(
    dto: CreateOcrModelDto,
    files: UploadedFiles,
    uploadedById: string
  ): Promise<OcrModelDto> {
    if (!files.configFile) {
      throw new BadRequestException('configFile is required for LLM models')
    }
    parseLlmConfig(files.configFile.buffer.toString('utf8')) // validate; throws on invalid

    const created = await this.repository.create({
      name: dto.name,
      description: dto.description ?? null,
      type: OcrModelType.LITELLM,
      reference: LLM_RUNNER_SCRIPT,
      uploadedById,
    })

    try {
      const configFile = prepareLlmConfigFile(
        files.configFile.buffer.toString('utf8'),
        dto.outputFormatPrompt,
        'ocr'
      )
      const configFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        created.id,
        'config',
        configFile
      )
      await this.repository.update(created.id, { configFilePath })
    } catch (err) {
      await this.modelFiles.deleteModelDirectory(CATEGORY, created.id)
      await this.repository.delete(created.id)
      throw err
    }

    return this.findById(created.id)
  }

  async update(
    id: string,
    dto: UpdateOcrModelDto,
    files: UploadedFiles
  ): Promise<OcrModelDto> {
    const existing = await this.repository.findById(id)
    if (!existing) throw new NotFoundException('Model not found')
    if (existing.type === OcrModelType.BUILTIN) {
      throw new ForbiddenException('Built-in models cannot be edited')
    }

    if (existing.type === OcrModelType.LITELLM) {
      if (
        files.inputMapperFile ||
        files.outputMapperFile ||
        dto.huggingfaceId !== undefined
      ) {
        throw new BadRequestException(
          'LLM models accept only name, description and a configFile'
        )
      }
      if (files.configFile) {
        parseLlmConfig(files.configFile.buffer.toString('utf8')) // validate
      }
    }

    if (dto.name && dto.name !== existing.name) {
      const byName = await this.repository.findByName(dto.name)
      if (byName && byName.id !== id) {
        throw new ConflictException(
          `Model with name "${dto.name}" already exists`
        )
      }
    }

    const patch: Partial<OcrModelEntity> = {}
    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined)
      patch.description = dto.description || null
    if (dto.huggingfaceId !== undefined) patch.reference = dto.huggingfaceId

    if (existing.type === OcrModelType.LITELLM) {
      if (files.configFile || dto.outputFormatPrompt !== undefined) {
        const raw = files.configFile
          ? files.configFile.buffer.toString('utf8')
          : await this.modelFiles.readText(existing.configFilePath!)
        patch.configFilePath = await this.modelFiles.writeFile(
          CATEGORY,
          id,
          'config',
          prepareLlmConfigFile(raw, dto.outputFormatPrompt, 'ocr'),
          { previousRelativePath: existing.configFilePath }
        )
      }
    } else if (files.configFile) {
      patch.configFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        id,
        'config',
        files.configFile,
        { previousRelativePath: existing.configFilePath }
      )
    }

    if (files.inputMapperFile) {
      patch.inputMapperFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        id,
        'input-mapper',
        files.inputMapperFile,
        { previousRelativePath: existing.inputMapperFilePath }
      )
    }
    if (files.outputMapperFile) {
      patch.outputMapperFilePath = await this.modelFiles.writeFile(
        CATEGORY,
        id,
        'output-mapper',
        files.outputMapperFile,
        { previousRelativePath: existing.outputMapperFilePath }
      )
    }

    if (Object.keys(patch).length > 0) {
      await this.repository.update(id, patch)
    }

    return this.findById(id)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id)
    if (!existing) throw new NotFoundException('Model not found')
    if (existing.type === OcrModelType.BUILTIN) {
      throw new ForbiddenException('Built-in models cannot be deleted')
    }

    await this.repository.delete(id)
    await this.modelFiles.deleteModelDirectory(CATEGORY, id)
  }

  private assertAllFilesPresent(files: UploadedFiles): void {
    if (
      !files.configFile ||
      !files.inputMapperFile ||
      !files.outputMapperFile
    ) {
      throw new BadRequestException(
        'configFile, inputMapperFile, and outputMapperFile are all required'
      )
    }
  }
}
