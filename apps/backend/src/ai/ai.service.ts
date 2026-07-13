import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { spawn, SpawnOptionsWithoutStdio } from 'child_process'
import * as path from 'path'
import { PathService } from 'src/common/services'
import * as fs from 'fs'
import {
  AdjustAllResultDto,
  AdjustBrightnessResultDto,
  AdjustContrastResultDto,
  AdjustSharpnessResultDto,
  CropResultDto,
  ExitStatusDto,
  RotateResultDto,
} from './dto'
import { DirectoryService } from 'src/directory/directory.service'
import { FileService } from 'src/file/file.service'
import { ActivityService } from 'src/activity/activity.service'
import { ActivityOperation } from 'src/activity/enums'
import { ScriptExecutionError } from './script-execution.error'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  constructor(
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly activityService: ActivityService
  ) {}

  async runScript(
    command: string,
    args?: string[],
    options?: SpawnOptionsWithoutStdio,
    input?: string
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, [...args], options)

      if (input !== undefined && process.stdin) {
        // Surface stdin write errors (e.g. EPIPE if the child exits before
        // reading) instead of letting the promise hang on 'close'.
        process.stdin.on('error', reject)
        process.stdin.write(input)
        process.stdin.end()
      }

      let result = ''
      let error = ''

      process.stdout.on('data', data => {
        result += data.toString()
      })

      process.stderr.on('data', data => {
        error += data.toString()
      })

      process.on('error', (err: Error) => {
        reject(
          new Error(`Failed to start command: ${command}. ${err.message}.`)
        )
      })

      process.on('close', code => {
        if (code !== 0) {
          reject(
            new ScriptExecutionError(
              `Command failed: ${command} ${args?.join(' ') ?? ''}. ${error || 'Unknown error'}`,
              result,
              error,
              code
            )
          )
        } else {
          try {
            resolve(result)
          } catch (err: unknown) {
            reject(
              new Error(
                `Command ${command} ${args.join(' ')} error: ${error || (err as Error)?.message || 'Unknown error'}`
              )
            )
          }
        }
      })
    })
  }

  readExitStatus() {
    const statusFilePath = path.join(
      process.cwd(),
      '.tmp',
      'status',
      'exit_status.json'
    )
    if (!fs.existsSync(statusFilePath)) {
      return null
    }
    let fileContent: unknown
    try {
      const rawContent = fs.readFileSync(statusFilePath, 'utf8')
      fileContent = JSON.parse(rawContent)
    } catch {
      return null
    }
    return fileContent
  }

  initializeExitStatus() {
    const exitStatusFile = path.join(
      process.cwd(),
      '.tmp',
      'status',
      'exit_status.json'
    )
    fs.mkdirSync(path.dirname(exitStatusFile), { recursive: true })
    fs.writeFileSync(exitStatusFile, '')
  }

  removeExitStatus() {
    const statusFilePath = path.join(process.cwd(), '.tmp', 'status')
    if (fs.existsSync(statusFilePath)) {
      fs.rmSync(statusFilePath, { recursive: true })
    }
  }

  private async markImageModified(
    inputDir: string,
    fileName: string,
    humanModified = false
  ): Promise<void> {
    const directory = await this.directoryService.resolveByPath(inputDir)
    const file = await this.fileService.findOne({
      name: fileName,
      directoryId: directory?.id ?? null,
    })
    if (file) {
      file.imageModified = true
      if (humanModified) {
        file.humanModified = true
      }
      await this.fileService.save(file)
    }
  }

  private async recordSplitPdfActivities(
    sourceFileName: string,
    outputDir: string,
    numberOfPages: number | undefined,
    userId: string
  ): Promise<void> {
    if (!numberOfPages || numberOfPages <= 0) return
    const baseName = sourceFileName.replace(/\.pdf$/i, '')
    const pagesDir = path.posix.join(outputDir, 'pages')
    for (let i = 1; i < numberOfPages; i++) {
      const pageId = i < 10 ? `0${i}` : String(i)
      const generatedName = `${baseName}-${pageId}.jpg`
      const fileId = await this.fileService.findIdByDirAndName(
        pagesDir,
        generatedName
      )
      if (!fileId) continue
      await this.activityService
        .recordManualOperation({
          fileId,
          userId,
          operation: ActivityOperation.PDF_SPLIT,
          metadata: {
            sourceFileName,
            pageCount: numberOfPages,
          },
        })
        .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
    }
  }

  async splitPdf(
    file: Express.Multer.File,
    outputDir: string,
    userId: string
  ): Promise<unknown> {
    try {
      this.initializeExitStatus()
      await this.runScript(
        'python',
        [
          path.join(
            this.scriptDir,
            'app',
            'documents',
            'split_and_save_pages_for_pdf.py'
          ),
          file.destination,
          file.originalname,
          this.pathService.getAbsolutePath(outputDir),
          path.join(process.cwd(), '.tmp', 'status'),
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )
      const status = this.readExitStatus() as {
        success: boolean
        message: string
        number_of_pages?: number
      }
      if (!status || !status.success) {
        throw new BadRequestException(
          status?.message || 'Failed to split PDF file.'
        )
      }
      await this.recordSplitPdfActivities(
        file.originalname,
        outputDir,
        status.number_of_pages,
        userId
      )
      return new ExitStatusDto(status.success, status.message)
    } catch {
      throw new BadRequestException('Failed to split PDF file.')
    } finally {
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path)
        } catch (cleanupError) {
          this.logger.error('Failed to delete uploaded file:', cleanupError)
        }
      }
      this.removeExitStatus()
    }
  }

  async rotateImage(
    inputDir: string,
    fileName: string,
    angle: number,
    outputDir: string,
    userId: string
  ): Promise<RotateResultDto> {
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const imageId = path.basename(fileName, path.extname(fileName))
    const outputPathAbsolute = this.pathService.buildAbsolutePath(
      outputDir,
      fileName
    )
    const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
    fs.mkdirSync(outputDirAbsolute, { recursive: true })

    try {
      const scriptPath = path.join(
        this.scriptDir,
        'app',
        'image_processing',
        'rotate.py'
      )
      const result = (await this.runScript(
        'python',
        [
          scriptPath,
          imageId,
          inputPathAbsolute,
          String(angle),
          outputPathAbsolute,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
        outputPath?: string
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to rotate image.'
        )
      }
      await this.markImageModified(inputDir, fileName, true)
      const fileId = await this.fileService.findIdByDirAndName(
        inputDir,
        fileName
      )
      if (fileId) {
        await this.activityService
          .recordManualOperation({
            fileId,
            userId,
            operation: ActivityOperation.ROTATE,
            metadata: { angle },
          })
          .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
      }
      return {
        success: true,
        message: status.messageText ?? 'Image successfully rotated.',
        outputPath: this.pathService.buildRelativePath(outputDir, fileName),
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      this.logger.error('Rotate image failed', err)
      throw new BadRequestException('Failed to rotate image.')
    }
  }

  async cropImage(
    inputDir: string,
    fileName: string,
    topLeft: { x: number; y: number },
    bottomRight: { x: number; y: number },
    outputDir: string,
    userId: string
  ): Promise<CropResultDto> {
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const imageId = path.basename(fileName, path.extname(fileName))
    const outputPathAbsolute = this.pathService.buildAbsolutePath(
      outputDir,
      fileName
    )
    const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
    fs.mkdirSync(outputDirAbsolute, { recursive: true })

    try {
      const scriptPath = path.join(
        this.scriptDir,
        'app',
        'image_processing',
        'crop.py'
      )
      const result = (await this.runScript(
        'python',
        [
          scriptPath,
          imageId,
          inputPathAbsolute,
          String(Math.round(topLeft.x)),
          String(Math.round(topLeft.y)),
          String(Math.round(bottomRight.x)),
          String(Math.round(bottomRight.y)),
          outputPathAbsolute,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
        outputPath?: string
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to crop image.'
        )
      }
      await this.markImageModified(inputDir, fileName, true)
      const fileId = await this.fileService.findIdByDirAndName(
        inputDir,
        fileName
      )
      if (fileId) {
        await this.activityService
          .recordManualOperation({
            fileId,
            userId,
            operation: ActivityOperation.CROP,
            metadata: { topLeft, bottomRight },
          })
          .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
      }
      return {
        success: true,
        message: status.messageText ?? 'Image successfully cropped.',
        outputPath: this.pathService.buildRelativePath(outputDir, fileName),
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      this.logger.error('Crop image failed', err)
      throw new BadRequestException('Failed to crop image.')
    }
  }

  async adjustBrightness(
    inputDir: string,
    fileName: string,
    brightness: number,
    outputDir: string,
    userId: string
  ): Promise<AdjustBrightnessResultDto> {
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const imageId = path.basename(fileName, path.extname(fileName))
    const outputPathAbsolute = this.pathService.buildAbsolutePath(
      outputDir,
      fileName
    )
    const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
    fs.mkdirSync(outputDirAbsolute, { recursive: true })

    try {
      const scriptPath = path.join(
        this.scriptDir,
        'app',
        'image_processing',
        'adjust_brightness.py'
      )
      const result = (await this.runScript(
        'python',
        [
          scriptPath,
          imageId,
          inputPathAbsolute,
          String(brightness),
          outputPathAbsolute,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
        outputPath?: string
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to adjust brightness.'
        )
      }
      await this.markImageModified(inputDir, fileName, true)
      const fileId = await this.fileService.findIdByDirAndName(
        inputDir,
        fileName
      )
      if (fileId) {
        await this.activityService
          .recordManualOperation({
            fileId,
            userId,
            operation: ActivityOperation.BRIGHTNESS_ADJUST,
            metadata: { brightness },
          })
          .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
      }
      return {
        success: true,
        message: status.messageText ?? 'Image brightness changed successfully.',
        outputPath: this.pathService.buildRelativePath(outputDir, fileName),
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      this.logger.error('Adjust brightness failed', err)
      throw new BadRequestException('Failed to adjust brightness.')
    }
  }

  async adjustContrast(
    inputDir: string,
    fileName: string,
    contrast: number,
    outputDir: string,
    userId: string
  ): Promise<AdjustContrastResultDto> {
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const imageId = path.basename(fileName, path.extname(fileName))
    const outputPathAbsolute = this.pathService.buildAbsolutePath(
      outputDir,
      fileName
    )
    const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
    fs.mkdirSync(outputDirAbsolute, { recursive: true })

    try {
      const scriptPath = path.join(
        this.scriptDir,
        'app',
        'image_processing',
        'adjust_contrast.py'
      )
      const result = (await this.runScript(
        'python',
        [
          scriptPath,
          imageId,
          inputPathAbsolute,
          String(contrast),
          outputPathAbsolute,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
        outputPath?: string
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to adjust contrast.'
        )
      }
      await this.markImageModified(inputDir, fileName, true)
      const fileId = await this.fileService.findIdByDirAndName(
        inputDir,
        fileName
      )
      if (fileId) {
        await this.activityService
          .recordManualOperation({
            fileId,
            userId,
            operation: ActivityOperation.CONTRAST_ADJUST,
            metadata: { contrast },
          })
          .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
      }
      return {
        success: true,
        message: status.messageText ?? 'Image constrast changed successfully.',
        outputPath: this.pathService.buildRelativePath(outputDir, fileName),
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      this.logger.error('Adjust contrast failed', err)
      throw new BadRequestException('Failed to adjust contrast.')
    }
  }

  async adjustSharpness(
    inputDir: string,
    fileName: string,
    sharpness: number,
    outputDir: string,
    userId: string
  ): Promise<AdjustSharpnessResultDto> {
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const imageId = path.basename(fileName, path.extname(fileName))
    const outputPathAbsolute = this.pathService.buildAbsolutePath(
      outputDir,
      fileName
    )
    const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
    fs.mkdirSync(outputDirAbsolute, { recursive: true })

    try {
      const scriptPath = path.join(
        this.scriptDir,
        'app',
        'image_processing',
        'adjust_sharpness.py'
      )
      const result = (await this.runScript(
        'python',
        [
          scriptPath,
          imageId,
          inputPathAbsolute,
          String(sharpness),
          outputPathAbsolute,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
        outputPath?: string
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to adjust sharpness.'
        )
      }
      await this.markImageModified(inputDir, fileName, true)
      const fileId = await this.fileService.findIdByDirAndName(
        inputDir,
        fileName
      )
      if (fileId) {
        await this.activityService
          .recordManualOperation({
            fileId,
            userId,
            operation: ActivityOperation.SHARPNESS_ADJUST,
            metadata: { sharpness },
          })
          .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
      }
      return {
        success: true,
        message: status.messageText ?? 'Image sharpness changed successfully.',
        outputPath: this.pathService.buildRelativePath(outputDir, fileName),
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      this.logger.error('Adjust sharpness failed', err)
      throw new BadRequestException('Failed to adjust sharpness.')
    }
  }

  async adjustAll(
    inputDir: string,
    fileName: string,
    brightness: number,
    contrast: number,
    sharpness: number,
    outputDir: string,
    userId: string
  ): Promise<AdjustAllResultDto> {
    const inputPathAbsolute = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    const imageId = path.basename(fileName, path.extname(fileName))
    const outputPathAbsolute = this.pathService.buildAbsolutePath(
      outputDir,
      fileName
    )
    const outputDirAbsolute = this.pathService.getAbsolutePath(outputDir)
    fs.mkdirSync(outputDirAbsolute, { recursive: true })

    try {
      const scriptPath = path.join(
        this.scriptDir,
        'app',
        'image_processing',
        'adjust_all.py'
      )
      const result = (await this.runScript(
        'python',
        [
          scriptPath,
          imageId,
          inputPathAbsolute,
          String(brightness),
          String(contrast),
          String(sharpness),
          outputPathAbsolute,
        ],
        {
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const parsed = JSON.parse(result.trim()) as {
        status?: { success?: boolean; messageText?: string }
        outputPath?: string
      }
      const status = parsed?.status
      if (!status?.success) {
        throw new BadRequestException(
          status?.messageText || 'Failed to adjust image.'
        )
      }
      await this.markImageModified(inputDir, fileName, true)
      const fileId = await this.fileService.findIdByDirAndName(
        inputDir,
        fileName
      )
      if (fileId) {
        const adjustments: Array<{
          operation: ActivityOperation
          metadata: Record<string, unknown>
        }> = [
          {
            operation: ActivityOperation.BRIGHTNESS_ADJUST,
            metadata: { brightness },
          },
          {
            operation: ActivityOperation.CONTRAST_ADJUST,
            metadata: { contrast },
          },
          {
            operation: ActivityOperation.SHARPNESS_ADJUST,
            metadata: { sharpness },
          },
        ]
        for (const adj of adjustments) {
          await this.activityService
            .recordManualOperation({
              fileId,
              userId,
              operation: adj.operation,
              metadata: adj.metadata,
            })
            .catch(e => this.logger.error(`Activity log failed: ${e.message}`))
        }
      }
      return {
        success: true,
        message: status.messageText ?? 'Image successfully adjusted.',
        outputPath: this.pathService.buildRelativePath(outputDir, fileName),
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err
      this.logger.error('Adjust all failed', err)
      throw new BadRequestException('Failed to adjust image.')
    }
  }
}
