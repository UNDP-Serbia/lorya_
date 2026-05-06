import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { DataSource, QueryRunner } from 'typeorm'
import { DirectoryEntryDto } from './dto'
import { DirectoryEntryType } from './types'
import { PathService } from 'src/common/services'
import { DirectoryService } from '../directory/directory.service'
import { DirectoryEntity } from '../directory/directory.entity'
import { FileService } from '../file/file.service'
import { FileEntity } from '../file/file.entity'
import { FileStatus } from '../file/types'
import { isAtLeast } from '../file/file.helpers'
import { AiService } from '../ai/ai.service'
import { ActivityService } from 'src/activity/activity.service'
import { ActivityOperation } from 'src/activity/enums'
import * as nodePath from 'path'
import * as fs from 'fs'
import * as mime from 'mime-types'
import { pathHelpers } from 'src/common/helpers/path.helper'
import { DownloadEntryDto } from './dto/download-entry.dto'
import { runInTransaction } from 'src/common/helpers/run-transactional.helper'
import { SegmentRepository } from 'src/segment-management/segment.repository'
import { OcrResultRepository } from 'src/ocr/ocr-result.repository'
import { PostOcrCorrectionResultRepository } from 'src/post-ocr-correction/post-ocr-correction-result.repository'

@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name)

  constructor(
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService,
    @Inject('ORIGINALS_PATH_SERVICE')
    private readonly originalsPathService: PathService,
    @Inject('SEGMENTS_PATH_SERVICE')
    private readonly segmentsPathService: PathService,
    @Inject('SCRIPT_DIR') private readonly scriptDir: string,
    @Inject('CONDA_ENV') private readonly condaEnv: string,
    private readonly directoryService: DirectoryService,
    private readonly fileService: FileService,
    private readonly aiService: AiService,
    private readonly activityService: ActivityService,
    private readonly dataSource: DataSource,
    private readonly segmentRepository: SegmentRepository,
    private readonly ocrResultRepository: OcrResultRepository,
    private readonly postOcrCorrectionResultRepository: PostOcrCorrectionResultRepository
  ) {}

  async getEntries(directoryPath: string): Promise<DirectoryEntryDto[]> {
    const formatted = pathHelpers.formatPath(directoryPath)
    const parentDir = await this.directoryService.resolveByPath(formatted)

    if (formatted && formatted !== '' && !parentDir) {
      return []
    }

    const parentId = parentDir?.id ?? null
    const parentPath = parentDir
      ? await this.directoryService.buildRelativePath(parentDir)
      : '/'

    return this.buildTreeFromDb(parentId, parentPath)
  }

  async createDirectory(
    folderPath: string,
    folderName: string
  ): Promise<DirectoryEntryDto> {
    const parentDir = await this.directoryService.resolveByPath(folderPath)
    const parentId = parentDir?.id ?? null

    const existing = await this.directoryService.findOne({
      name: folderName,
      parentId,
    })
    if (existing) {
      throw new BadRequestException('Directory already exists')
    }

    await runInTransaction(this.dataSource, async queryRunner => {
      await queryRunner.manager.save(DirectoryEntity, {
        name: folderName,
        parentId,
      })

      await this.pathService.createDirectory(folderPath, folderName)
    })

    return {
      type: DirectoryEntryType.DIRECTORY,
      path: this.pathService.buildRelativePath(folderPath),
      name: folderName,
    } as DirectoryEntryDto
  }

  async renameEntries(
    ...entries: {
      type: DirectoryEntryType
      path: string
      name: string
      newName: string
    }[]
  ): Promise<DirectoryEntryDto[]> {
    const completedFsOps: {
      type: DirectoryEntryType
      path: string
      oldName: string
      newName: string
    }[] = []

    try {
      await runInTransaction(this.dataSource, async queryRunner => {
        for (const entry of entries) {
          const parentDir = await this.directoryService.resolveByPath(
            entry.path
          )
          const parentId = parentDir?.id ?? null

          if (entry.type === DirectoryEntryType.DIRECTORY) {
            const dir = await this.directoryService.findOne({
              name: entry.name,
              parentId,
            })
            if (!dir) {
              throw new BadRequestException(
                `Entry does not exist: ${entry.name}`
              )
            }

            const duplicate = await this.directoryService.findOne({
              name: entry.newName,
              parentId,
            })
            if (duplicate) {
              throw new BadRequestException(
                `Entry already exists: ${entry.newName}`
              )
            }

            dir.name = entry.newName
            await queryRunner.manager.save(DirectoryEntity, dir)

            const newRelativePath =
              await this.directoryService.buildRelativePath(dir)
            await this.updateFileRelativePaths(
              queryRunner,
              dir,
              newRelativePath
            )

            await this.pathService.renameEntry(
              entry.type,
              entry.path,
              entry.name,
              entry.newName
            )
            completedFsOps.push({
              type: entry.type,
              path: entry.path,
              oldName: entry.name,
              newName: entry.newName,
            })
          } else {
            const file = await this.fileService.findOne({
              name: entry.name,
              directoryId: parentId,
            })
            if (!file) {
              throw new BadRequestException(
                `Entry does not exist: ${entry.name}`
              )
            }

            const duplicate = await this.fileService.findOne({
              name: entry.newName,
              directoryId: parentId,
            })
            if (duplicate) {
              throw new BadRequestException(
                `Entry already exists: ${entry.newName}`
              )
            }

            file.name = entry.newName
            file.extension = nodePath.extname(entry.newName)
            await queryRunner.manager.save(FileEntity, file)

            await this.pathService.renameEntry(
              entry.type,
              entry.path,
              entry.name,
              entry.newName
            )
            completedFsOps.push({
              type: entry.type,
              path: entry.path,
              oldName: entry.name,
              newName: entry.newName,
            })
          }
        }
      })

      return entries.map(entry => ({
        type: entry.type,
        path: this.pathService.buildRelativePath(entry.path),
        name: entry.newName,
      }))
    } catch (err) {
      for (const op of completedFsOps) {
        await this.pathService
          .renameEntry(op.type, op.path, op.newName, op.oldName)
          .catch(() => {})
      }
      throw err
    }
  }

  async moveEntries(
    ...entries: {
      type: DirectoryEntryType
      path: string
      name: string
      newPath: string
    }[]
  ): Promise<DirectoryEntryDto[]> {
    const completedFsOps: {
      type: DirectoryEntryType
      name: string
      fromPath: string
      toPath: string
    }[] = []

    try {
      await runInTransaction(this.dataSource, async queryRunner => {
        for (const entry of entries) {
          const sourceParent = await this.directoryService.resolveByPath(
            entry.path
          )
          const sourceParentId = sourceParent?.id ?? null
          const destParent = await this.directoryService.resolveByPath(
            entry.newPath
          )
          const destParentId = destParent?.id ?? null

          if (entry.type === DirectoryEntryType.DIRECTORY) {
            const dir = await this.directoryService.findOne({
              name: entry.name,
              parentId: sourceParentId,
            })
            if (!dir) {
              throw new BadRequestException(
                `Entry does not exist: ${entry.name}`
              )
            }

            const duplicate = await this.directoryService.findOne({
              name: entry.name,
              parentId: destParentId,
            })
            if (duplicate) {
              throw new BadRequestException(
                `Entry already exists: ${entry.name}`
              )
            }

            dir.parentId = destParentId
            await queryRunner.manager.save(DirectoryEntity, dir)

            const newRelativePath =
              await this.directoryService.buildRelativePath(dir)
            await this.updateFileRelativePaths(
              queryRunner,
              dir,
              newRelativePath
            )

            await this.pathService.moveEntry(
              entry.type,
              entry.path,
              entry.name,
              entry.newPath
            )
            completedFsOps.push({
              type: entry.type,
              name: entry.name,
              fromPath: entry.path,
              toPath: entry.newPath,
            })
          } else {
            const file = await this.fileService.findOne({
              name: entry.name,
              directoryId: sourceParentId,
            })
            if (!file) {
              throw new BadRequestException(
                `Entry does not exist: ${entry.name}`
              )
            }

            const duplicate = await this.fileService.findOne({
              name: entry.name,
              directoryId: destParentId,
            })
            if (duplicate) {
              throw new BadRequestException(
                `Entry already exists: ${entry.name}`
              )
            }

            file.directoryId = destParentId
            file.relativePath = pathHelpers.formatPath(entry.newPath)
            await queryRunner.manager.save(FileEntity, file)

            await this.pathService.moveEntry(
              entry.type,
              entry.path,
              entry.name,
              entry.newPath
            )
            completedFsOps.push({
              type: entry.type,
              name: entry.name,
              fromPath: entry.path,
              toPath: entry.newPath,
            })
          }
        }
      })

      return entries.map(entry => ({
        type: entry.type,
        path: this.pathService.buildRelativePath(entry.newPath),
        name: entry.name,
      }))
    } catch (err) {
      for (const op of completedFsOps) {
        await this.pathService
          .moveEntry(op.type, op.toPath, op.name, op.fromPath)
          .catch(() => {})
      }
      throw err
    }
  }

  async deleteEntries(
    ...entries: { type: DirectoryEntryType; path: string; name: string }[]
  ): Promise<DirectoryEntryDto[]> {
    await runInTransaction(this.dataSource, async queryRunner => {
      for (const entry of entries) {
        const parentDir = await this.directoryService.resolveByPath(entry.path)
        const parentId = parentDir?.id ?? null

        if (entry.type === DirectoryEntryType.DIRECTORY) {
          const dir = await this.directoryService.findOne({
            name: entry.name,
            parentId,
          })
          if (!dir) {
            throw new BadRequestException(`Entry does not exist: ${entry.name}`)
          }

          const filesToDelete = await this.collectFilesInDirectory(dir.id)

          await queryRunner.manager.delete(DirectoryEntity, {
            id: dir.id,
          })

          await this.pathService.deleteEntry(entry.type, entry.path, entry.name)

          await Promise.all(
            filesToDelete.flatMap(file => [
              this.originalsPathService
                .deleteEntry(
                  DirectoryEntryType.FILE,
                  '',
                  `${file.id}${file.extension}`
                )
                .catch(() => {}),
              this.segmentsPathService
                .deleteEntry(DirectoryEntryType.DIRECTORY, '', file.id)
                .catch(() => {}),
            ])
          )
        } else {
          const file = await this.fileService.findOne({
            name: entry.name,
            directoryId: parentId,
          })
          if (!file) {
            throw new BadRequestException(`Entry does not exist: ${entry.name}`)
          }

          await queryRunner.manager.delete(FileEntity, {
            id: file.id,
          })

          await this.pathService.deleteEntry(entry.type, entry.path, entry.name)
          await this.originalsPathService
            .deleteEntry(
              DirectoryEntryType.FILE,
              '',
              `${file.id}${file.extension}`
            )
            .catch(() => {})
          await this.segmentsPathService
            .deleteEntry(DirectoryEntryType.DIRECTORY, '', file.id)
            .catch(() => {})
        }
      }
    })

    return entries.map(entry => ({
      type: entry.type,
      path: this.pathService.buildRelativePath(entry.path),
      name: entry.name,
    }))
  }

  async resetFile(
    inputDir: string,
    fileName: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const directory = await this.directoryService.resolveByPath(inputDir)
    const file = await this.fileService.findOne({
      name: fileName,
      directoryId: directory?.id ?? null,
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    const originalRelPath = `${file.id}${file.extension}`
    if (
      !this.originalsPathService.isPathExists(
        originalRelPath,
        DirectoryEntryType.FILE
      )
    ) {
      throw new UnprocessableEntityException('Original file not found on disk')
    }

    await runInTransaction(this.dataSource, async queryRunner => {
      await this.postOcrCorrectionResultRepository.softDeleteByFileIdTransactional(
        queryRunner,
        file.id
      )
      await this.ocrResultRepository.softDeleteByFileIdTransactional(
        queryRunner,
        file.id
      )
      await this.segmentRepository.softDeleteByFileIdTransactional(
        queryRunner,
        file.id
      )

      await queryRunner.manager.update(
        FileEntity,
        { id: file.id },
        {
          status: FileStatus.INITIALIZED,
          imageModified: false,
          humanModified: false,
        }
      )
    })

    // Copy original over modified on disk
    const originalAbsPath =
      this.originalsPathService.getAbsolutePath(originalRelPath)
    const modifiedAbsPath = this.pathService.buildAbsolutePath(
      inputDir,
      fileName
    )
    await fs.promises.copyFile(originalAbsPath, modifiedAbsPath)

    await this.activityService
      .recordManualOperation({
        fileId: file.id,
        userId,
        operation: ActivityOperation.FILE_RESET,
        metadata: {},
      })
      .catch(e => this.logger.error(`Activity log failed: ${e.message}`))

    return { success: true }
  }

  async exportAlto(
    fileId: string
  ): Promise<{ xmlContent: string; filename: string }> {
    const file = await this.fileService.findOne({ id: fileId })

    if (!file) {
      throw new NotFoundException(`File with id ${fileId} not found`)
    }

    if (
      file.status !== FileStatus.POST_OCR_COMPLETED &&
      file.status !== FileStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Export is only available for files with completed post-OCR processing'
      )
    }

    try {
      const xmlContent = (await this.aiService.runScript(
        'python',
        [
          nodePath.join(this.scriptDir, 'app', 'export', 'export_to_alto.py'),
          JSON.stringify({ fileId }),
        ],
        {
          cwd: nodePath.join(this.scriptDir, 'app', 'export'),
          env: {
            ...process.env,
            PATH: `${this.condaEnv}/bin:$PATH`,
          },
        }
      )) as string

      const filename = nodePath.basename(file.name, file.extension)

      return { xmlContent, filename }
    } catch (err) {
      this.logger.error('ALTO export failed', err)
      throw new InternalServerErrorException('Failed to generate ALTO export')
    }
  }

  resolveDownloadEntries(entries: DownloadEntryDto[]) {
    return entries.map(entry => {
      const relativePath = this.pathService.buildRelativePath(
        entry.path,
        entry.name
      )
      const absolutePath = this.pathService.buildAbsolutePath(
        entry.path,
        entry.name
      )

      const rootAbsolute = this.pathService.getAbsolutePath()
      if (!absolutePath.startsWith(rootAbsolute)) {
        throw new BadRequestException('Invalid path')
      }

      if (!this.pathService.isPathExists(relativePath, entry.type)) {
        throw new NotFoundException(
          `${entry.type === DirectoryEntryType.FILE ? 'File' : 'Directory'} not found: ${entry.name}`
        )
      }

      return {
        type: entry.type,
        name: entry.name,
        absolutePath,
        contentType:
          entry.type === DirectoryEntryType.FILE
            ? mime.lookup(entry.name) || 'application/octet-stream'
            : undefined,
      }
    })
  }

  private async copyUploadedToOriginals(
    relativePath: string,
    savedFiles: FileEntity[]
  ): Promise<void> {
    const formattedPath = pathHelpers.formatPath(relativePath)
    for (const file of savedFiles) {
      const sourcePath = this.pathService.buildAbsolutePath(
        formattedPath,
        file.name
      )
      await this.originalsPathService.copyFileFrom(
        sourcePath,
        '',
        `${file.id}${file.extension}`
      )
    }
  }

  async uploadFiles(
    relativePath: string,
    files: Express.Multer.File[]
  ): Promise<void> {
    let savedFiles: FileEntity[] | undefined
    try {
      const formatted = pathHelpers.formatPath(relativePath)
      const parentDir = await this.directoryService.resolveByPath(formatted)
      const parentId = parentDir?.id ?? null

      if (formatted && formatted !== '' && !parentDir) {
        throw new BadRequestException(
          `Directory does not exist: ${relativePath}`
        )
      }
      await runInTransaction(this.dataSource, async queryRunner => {
        const fileEntities = files.map(file => ({
          name: file.filename,
          extension: nodePath.extname(file.filename),
          size: file.size,
          mimeType: file.mimetype,
          relativePath: formatted,
          directoryId: parentId,
        }))

        savedFiles = await this.fileService.createManyTransactional(
          queryRunner,
          fileEntities
        )

        await this.copyUploadedToOriginals(relativePath, savedFiles)
      })
    } catch (err) {
      const filenames = files.map(f => f.filename)
      await this.removeUploadedFromStorage(relativePath, filenames).catch(
        () => {}
      )
      if (savedFiles) {
        await this.removeUploadedFromOriginals(savedFiles)
      }
      throw err
    }
  }

  private async removeUploadedFromStorage(
    relativePath: string,
    filenames: string[]
  ): Promise<void> {
    const formattedPath = pathHelpers.formatPath(relativePath)
    await Promise.all(
      filenames.map(filename =>
        this.pathService
          .deleteEntry(DirectoryEntryType.FILE, formattedPath, filename)
          .catch(() => {})
      )
    )
  }

  private async removeUploadedFromOriginals(
    savedFiles: FileEntity[]
  ): Promise<void> {
    await Promise.all(
      savedFiles.map(file =>
        this.originalsPathService
          .deleteEntry(
            DirectoryEntryType.FILE,
            '',
            `${file.id}${file.extension}`
          )
          .catch(() => {})
      )
    )
  }

  private async fetchMetadataMaps(allFiles: FileEntity[]): Promise<{
    layoutConfidenceMap: Map<string, number>
    layoutHumanModifiedMap: Map<string, boolean>
    ocrConfidenceMap: Map<string, number>
    ocrHumanModifiedMap: Map<string, boolean>
    postOcrConfidenceMap: Map<string, number>
    postOcrHumanModifiedMap: Map<string, boolean>
  }> {
    const segmentedFileIds = allFiles
      .filter(f => isAtLeast(f.status, FileStatus.SEGMENTED))
      .map(f => f.id)

    const ocrFileIds = allFiles
      .filter(f => isAtLeast(f.status, FileStatus.OCR_COMPLETED))
      .map(f => f.id)

    const postOcrFileIds = allFiles
      .filter(f => isAtLeast(f.status, FileStatus.POST_OCR_COMPLETED))
      .map(f => f.id)

    const [
      layoutRows,
      layoutHumanModifiedRows,
      ocrRows,
      ocrHumanModifiedRows,
      postOcrRows,
      postOcrHumanModifiedRows,
    ] = await Promise.all([
      // Layout confidence (existing)
      segmentedFileIds.length > 0
        ? this.dataSource
            .createQueryBuilder()
            .select('s."fileId"', 'fileId')
            .addSelect('AVG(s.confidence)', 'avg')
            .from('segments', 's')
            .where('s."fileId" IN (:...ids)', { ids: segmentedFileIds })
            .groupBy('s."fileId"')
            .getRawMany<{ fileId: string; avg: string }>()
        : Promise.resolve([]),

      // Layout humanModified
      segmentedFileIds.length > 0
        ? this.dataSource
            .createQueryBuilder()
            .select('s."fileId"', 'fileId')
            .addSelect('bool_or(s."humanModified")', 'humanModified')
            .from('segments', 's')
            .where('s."fileId" IN (:...ids)', { ids: segmentedFileIds })
            .groupBy('s."fileId"')
            .getRawMany<{ fileId: string; humanModified: boolean }>()
        : Promise.resolve([]),

      // OCR confidence (existing)
      ocrFileIds.length > 0
        ? this.dataSource
            .createQueryBuilder()
            .select('s."fileId"', 'fileId')
            .addSelect('AVG(ocr."avgWordConfidence")', 'avg')
            .from('ocr_results', 'ocr')
            .innerJoin('segments', 's', 's.id = ocr."segmentId"')
            .where('s."fileId" IN (:...ids)', { ids: ocrFileIds })
            .groupBy('s."fileId"')
            .getRawMany<{ fileId: string; avg: string }>()
        : Promise.resolve([]),

      // OCR humanModified (derived from edited_word_text in JSONB)
      ocrFileIds.length > 0
        ? (this.dataSource.query(
            `SELECT s."fileId",
              bool_or(
                EXISTS(
                  SELECT 1 FROM jsonb_array_elements(ocr.lines) AS line,
                  jsonb_array_elements(line->'words') AS word
                  WHERE word->>'edited_word_text' IS NOT NULL
                )
              ) AS "humanModified"
            FROM ocr_results ocr
            INNER JOIN segments s ON s.id = ocr."segmentId"
            WHERE s."fileId" = ANY($1)
            GROUP BY s."fileId"`,
            [ocrFileIds]
          ) as Promise<{ fileId: string; humanModified: boolean }[]>)
        : Promise.resolve([]),

      // Post-OCR confidence (existing)
      postOcrFileIds.length > 0
        ? this.dataSource
            .createQueryBuilder()
            .select('s."fileId"', 'fileId')
            .addSelect('AVG(pocr."avgWordConfidence")', 'avg')
            .from('post_ocr_correction_results', 'pocr')
            .innerJoin('segments', 's', 's.id = pocr."segmentId"')
            .where('s."fileId" IN (:...ids)', { ids: postOcrFileIds })
            .groupBy('s."fileId"')
            .getRawMany<{ fileId: string; avg: string }>()
        : Promise.resolve([]),

      // Post-OCR humanModified (derived from edited_word_text in JSONB)
      postOcrFileIds.length > 0
        ? (this.dataSource.query(
            `SELECT s."fileId",
              bool_or(
                EXISTS(
                  SELECT 1 FROM jsonb_array_elements(pocr.lines) AS line,
                  jsonb_array_elements(line->'words') AS word
                  WHERE word->>'edited_word_text' IS NOT NULL
                )
              ) AS "humanModified"
            FROM post_ocr_correction_results pocr
            INNER JOIN segments s ON s.id = pocr."segmentId"
            WHERE s."fileId" = ANY($1)
            GROUP BY s."fileId"`,
            [postOcrFileIds]
          ) as Promise<{ fileId: string; humanModified: boolean }[]>)
        : Promise.resolve([]),
    ])

    const round2 = (v: string) => {
      const n = parseFloat(v)
      return Number.isNaN(n) ? 0 : Math.round(n * 100) / 100
    }

    return {
      layoutConfidenceMap: new Map(
        layoutRows.map(r => [r.fileId, round2(r.avg)])
      ),
      layoutHumanModifiedMap: new Map(
        layoutHumanModifiedRows.map(r => [
          r.fileId,
          String(r.humanModified) === 'true',
        ])
      ),
      ocrConfidenceMap: new Map(ocrRows.map(r => [r.fileId, round2(r.avg)])),
      ocrHumanModifiedMap: new Map(
        ocrHumanModifiedRows.map(r => [
          r.fileId,
          String(r.humanModified) === 'true',
        ])
      ),
      postOcrConfidenceMap: new Map(
        postOcrRows.map(r => [r.fileId, round2(r.avg)])
      ),
      postOcrHumanModifiedMap: new Map(
        postOcrHumanModifiedRows.map(r => [
          r.fileId,
          String(r.humanModified) === 'true',
        ])
      ),
    }
  }

  private async buildTreeFromDb(
    parentId: string | null,
    parentPath: string
  ): Promise<DirectoryEntryDto[]> {
    const [allDirs, allFiles] = await Promise.all([
      this.directoryService.findAll(),
      this.fileService.findAll(),
    ])

    const metadataMaps = await this.fetchMetadataMaps(allFiles)

    const dirsByParent = new Map<string | null, DirectoryEntity[]>()
    for (const dir of allDirs) {
      const key = dir.parentId ?? null
      const list = dirsByParent.get(key) ?? []
      list.push(dir)
      dirsByParent.set(key, list)
    }

    const filesByDir = new Map<string | null, FileEntity[]>()
    for (const file of allFiles) {
      const key = file.directoryId ?? null
      const list = filesByDir.get(key) ?? []
      list.push(file)
      filesByDir.set(key, list)
    }

    return this.assembleTree(
      parentId,
      parentPath,
      dirsByParent,
      filesByDir,
      metadataMaps
    )
  }

  private assembleTree(
    parentId: string | null,
    parentPath: string,
    dirsByParent: Map<string | null, DirectoryEntity[]>,
    filesByDir: Map<string | null, FileEntity[]>,
    metadataMaps: {
      layoutConfidenceMap: Map<string, number>
      layoutHumanModifiedMap: Map<string, boolean>
      ocrConfidenceMap: Map<string, number>
      ocrHumanModifiedMap: Map<string, boolean>
      postOcrConfidenceMap: Map<string, number>
      postOcrHumanModifiedMap: Map<string, boolean>
    }
  ): DirectoryEntryDto[] {
    const dirs = dirsByParent.get(parentId) ?? []
    const files = filesByDir.get(parentId) ?? []
    const entries: DirectoryEntryDto[] = []

    for (const dir of dirs) {
      const dirPath =
        parentPath === '/' ? `/${dir.name}` : `${parentPath}/${dir.name}`
      entries.push({
        type: DirectoryEntryType.DIRECTORY,
        path: parentPath,
        name: dir.name,
        children: this.assembleTree(
          dir.id,
          dirPath,
          dirsByParent,
          filesByDir,
          metadataMaps
        ),
      })
    }

    for (const file of files) {
      entries.push({
        type: DirectoryEntryType.FILE,
        path: parentPath,
        name: file.name,
        fileId: file.id,
        status: file.status,
        metadata: {
          imageEnhancement: {
            confidence: null,
            humanModified: file.humanModified,
            imageModified: file.imageModified,
          },
          layoutIdentification: {
            confidence: metadataMaps.layoutConfidenceMap.get(file.id) ?? null,
            humanModified:
              metadataMaps.layoutHumanModifiedMap.get(file.id) ?? false,
          },
          ocr: {
            confidence: metadataMaps.ocrConfidenceMap.get(file.id) ?? null,
            humanModified:
              metadataMaps.ocrHumanModifiedMap.get(file.id) ?? false,
          },
          postOcr: {
            confidence: metadataMaps.postOcrConfidenceMap.get(file.id) ?? null,
            humanModified:
              metadataMaps.postOcrHumanModifiedMap.get(file.id) ?? false,
          },
        },
      })
    }

    return entries
  }

  private async updateFileRelativePaths(
    queryRunner: QueryRunner,
    directory: DirectoryEntity,
    newRelativePath: string
  ): Promise<void> {
    const formatted = pathHelpers.formatPath(newRelativePath)

    const allDirs = await this.directoryService.findAll()
    const childrenMap = new Map<string, DirectoryEntity[]>()
    for (const d of allDirs) {
      if (d.parentId) {
        const list = childrenMap.get(d.parentId) ?? []
        list.push(d)
        childrenMap.set(d.parentId, list)
      }
    }

    const updates: [string, string][] = []
    const collect = (id: string, path: string) => {
      updates.push([id, path])
      for (const child of childrenMap.get(id) ?? []) {
        collect(child.id, path ? `${path}/${child.name}` : child.name)
      }
    }
    collect(directory.id, formatted)

    for (const [dirId, path] of updates) {
      await queryRunner.manager.update(
        FileEntity,
        { directoryId: dirId },
        { relativePath: path }
      )
    }
  }

  private async collectFilesInDirectory(
    directoryId: string
  ): Promise<FileEntity[]> {
    const allDirs = await this.directoryService.findAll()
    const allFiles = await this.fileService.findAll()

    const childDirIds = new Set<string>()
    const collect = (parentId: string) => {
      childDirIds.add(parentId)
      for (const dir of allDirs) {
        if (dir.parentId === parentId) {
          collect(dir.id)
        }
      }
    }
    collect(directoryId)

    return allFiles.filter(
      file => file.directoryId && childDirIds.has(file.directoryId)
    )
  }
}
