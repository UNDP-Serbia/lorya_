import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectMapper } from '@automapper/nestjs'
import { Mapper } from '@automapper/core'
import { LayoutIdentificationModelRepository } from './layout-identification-model.repository'
import { LayoutIdentificationModelEntity } from './layout-identification-model.entity'
import { LayoutIdentificationModelType } from './types/layout-identification-model-type.enum'
import {
  CreateLayoutIdentificationModelDto,
  LayoutIdentificationModelDto,
  UpdateLayoutIdentificationModelDto,
} from './dto'
import { ModelFilesService } from 'src/common/services/model-files.service'

const CATEGORY = 'layout-identification'

interface UploadedFiles {
  configFile?: Express.Multer.File
  inputMapperFile?: Express.Multer.File
  outputMapperFile?: Express.Multer.File
}

@Injectable()
export class LayoutIdentificationModelService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly repository: LayoutIdentificationModelRepository,
    private readonly modelFiles: ModelFilesService
  ) {}

  async list(): Promise<LayoutIdentificationModelDto[]> {
    const entities = await this.repository.findAll()
    return this.mapper.mapArray(
      entities,
      LayoutIdentificationModelEntity,
      LayoutIdentificationModelDto
    )
  }

  async findById(id: string): Promise<LayoutIdentificationModelDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new NotFoundException('Model not found')
    return this.mapper.map(
      entity,
      LayoutIdentificationModelEntity,
      LayoutIdentificationModelDto
    )
  }

  async create(
    dto: CreateLayoutIdentificationModelDto,
    files: UploadedFiles,
    uploadedById: string
  ): Promise<LayoutIdentificationModelDto> {
    this.assertAllFilesPresent(files)

    const existing = await this.repository.findByName(dto.name)
    if (existing) {
      throw new ConflictException(
        `Model with name "${dto.name}" already exists`
      )
    }

    const created = await this.repository.create({
      name: dto.name,
      description: dto.description ?? null,
      type: LayoutIdentificationModelType.HUGGINGFACE,
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

  async update(
    id: string,
    dto: UpdateLayoutIdentificationModelDto,
    files: UploadedFiles
  ): Promise<LayoutIdentificationModelDto> {
    const existing = await this.repository.findById(id)
    if (!existing) throw new NotFoundException('Model not found')
    if (existing.type === LayoutIdentificationModelType.BUILTIN) {
      throw new ForbiddenException('Built-in models cannot be edited')
    }

    if (dto.name && dto.name !== existing.name) {
      const byName = await this.repository.findByName(dto.name)
      if (byName && byName.id !== id) {
        throw new ConflictException(
          `Model with name "${dto.name}" already exists`
        )
      }
    }

    const patch: Partial<LayoutIdentificationModelEntity> = {}
    if (dto.name !== undefined) patch.name = dto.name
    if (dto.description !== undefined)
      patch.description = dto.description || null
    if (dto.huggingfaceId !== undefined) patch.reference = dto.huggingfaceId

    if (files.configFile) {
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
    if (existing.type === LayoutIdentificationModelType.BUILTIN) {
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
