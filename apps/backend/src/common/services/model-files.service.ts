import { Inject, Injectable } from '@nestjs/common'
import * as fs from 'fs/promises'
import * as path from 'path'
import { PathService } from './path.service'

export type ModelFileKind = 'config' | 'input-mapper' | 'output-mapper'

export interface WriteFileOptions {
  previousRelativePath?: string | null
}

@Injectable()
export class ModelFilesService {
  constructor(
    @Inject('MODEL_FILES_PATH_SERVICE')
    private readonly pathService: PathService
  ) {}

  async writeFile(
    category: string,
    modelId: string,
    kind: ModelFileKind,
    file: Express.Multer.File,
    options: WriteFileOptions = {}
  ): Promise<string> {
    const relativeDir = path.posix.join(category, modelId, kind)
    const relativePath = path.posix.join(relativeDir, file.originalname)
    const absoluteDir = this.pathService.getAbsolutePath(relativeDir)
    const absolutePath = this.pathService.getAbsolutePath(relativePath)

    await fs.mkdir(absoluteDir, { recursive: true })

    if (options.previousRelativePath) {
      await this.deleteFile(options.previousRelativePath)
    }

    await fs.writeFile(absolutePath, file.buffer)
    return relativePath
  }

  async deleteFile(relativePath: string): Promise<void> {
    const absolutePath = this.pathService.getAbsolutePath(relativePath)
    try {
      await fs.unlink(absolutePath)
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return
      throw err
    }
  }

  async deleteModelDirectory(category: string, modelId: string): Promise<void> {
    const relativeDir = path.posix.join(category, modelId)
    const absolute = this.pathService.getAbsolutePath(relativeDir)
    await fs.rm(absolute, { recursive: true, force: true })
  }
}
