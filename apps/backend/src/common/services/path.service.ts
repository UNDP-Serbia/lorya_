import { Injectable } from '@nestjs/common'
import * as path from 'path'
import * as fs from 'fs'
import { DirectoryEntryType } from 'src/file-manager/types'
import { pathHelpers } from '../helpers'

@Injectable()
export class PathService {
  constructor(private readonly rootPath: string) {}

  formatPath = (fileSystemPath?: string | null) => {
    return pathHelpers.formatPath(fileSystemPath)
  }

  getAbsolutePath = (fileSystemPath?: string | null) => {
    return path.join(this.rootPath, this.formatPath(fileSystemPath))
  }

  buildRelativePath = (
    fileSystemRootPath?: string | null,
    fileSystemChildPath?: string | null
  ) => {
    const joinedPath = this.formatPath(
      path.join(
        this.formatPath(fileSystemRootPath),
        this.formatPath(fileSystemChildPath)
      )
    )
    return joinedPath.startsWith('/') ? joinedPath : `/${joinedPath}`
  }

  buildAbsolutePath = (
    fileSystemRootPath?: string | null,
    fileSystemChildPath?: string | null
  ) => {
    return path.join(
      this.rootPath,
      this.formatPath(fileSystemRootPath),
      this.formatPath(fileSystemChildPath)
    )
  }

  isPathExists = (
    fileSystemPath?: string | null,
    type?: DirectoryEntryType
  ) => {
    try {
      const fullPath = this.getAbsolutePath(fileSystemPath)

      if (!fs.existsSync(fullPath)) {
        return false
      }

      const stats = fs.statSync(fullPath)
      if (type === DirectoryEntryType.FILE) {
        return stats.isFile()
      } else if (type === DirectoryEntryType.DIRECTORY) {
        return stats.isDirectory()
      }
      return true
    } catch {
      return false
    }
  }

  getDirectoryEntries = async (
    directoryPath: string,
    options?: { recursive?: boolean }
  ) => {
    if (!this.isPathExists(directoryPath, DirectoryEntryType.DIRECTORY)) {
      return []
    }
    const { recursive = false } = options || {}
    return await fs.promises.readdir(this.getAbsolutePath(directoryPath), {
      withFileTypes: true,
      recursive,
    })
  }

  createDirectory = async (directoryPath: string, name: string) => {
    if (
      this.isPathExists(
        this.buildRelativePath(directoryPath, name),
        DirectoryEntryType.DIRECTORY
      )
    ) {
      throw new Error('Directory already exists')
    }
    return await fs.promises.mkdir(
      this.buildAbsolutePath(directoryPath, name),
      {
        recursive: true,
      }
    )
  }

  deleteEntry = async (
    type: DirectoryEntryType,
    directoryPath: string,
    name: string
  ) => {
    if (!this.isPathExists(this.buildRelativePath(directoryPath, name), type)) {
      throw new Error(
        `${{ [DirectoryEntryType.DIRECTORY]: 'Directory', [DirectoryEntryType.FILE]: 'File' }[type] || 'Entry'} does not exist`
      )
    }
    return await fs.promises.rm(this.buildAbsolutePath(directoryPath, name), {
      recursive: true,
    })
  }

  renameEntry = async (
    type: DirectoryEntryType,
    directoryPath: string,
    name: string,
    newName: string
  ) => {
    if (!this.isPathExists(this.buildRelativePath(directoryPath, name), type)) {
      throw new Error(
        `${{ [DirectoryEntryType.DIRECTORY]: 'Directory', [DirectoryEntryType.FILE]: 'File' }[type] || 'Entry'} does not exist`
      )
    }

    if (
      this.isPathExists(this.buildRelativePath(directoryPath, newName), type)
    ) {
      throw new Error(
        `${{ [DirectoryEntryType.DIRECTORY]: 'Directory', [DirectoryEntryType.FILE]: 'File' }[type] || 'Entry'} already exists`
      )
    }

    return await fs.promises.rename(
      this.buildAbsolutePath(directoryPath, name),
      this.buildAbsolutePath(directoryPath, newName)
    )
  }

  moveEntry = async (
    type: DirectoryEntryType,
    directoryPath: string,
    name: string,
    newDirectoryPath: string
  ) => {
    if (!this.isPathExists(this.buildRelativePath(directoryPath, name), type)) {
      throw new Error(
        `${{ [DirectoryEntryType.DIRECTORY]: 'Directory', [DirectoryEntryType.FILE]: 'File' }[type] || 'Entry'} does not exist`
      )
    }

    if (
      this.isPathExists(this.buildRelativePath(newDirectoryPath, name), type)
    ) {
      throw new Error(
        `${{ [DirectoryEntryType.DIRECTORY]: 'Directory', [DirectoryEntryType.FILE]: 'File' }[type] || 'Entry'} already exists`
      )
    }

    return await fs.promises.rename(
      this.buildAbsolutePath(directoryPath, name),
      this.buildAbsolutePath(newDirectoryPath, name)
    )
  }

  copyEntry = async (
    type: DirectoryEntryType,
    sourceDirectoryPath: string,
    sourceName: string,
    destDirectoryPath: string,
    destName: string
  ) => {
    if (
      !this.isPathExists(
        this.buildRelativePath(sourceDirectoryPath, sourceName),
        type
      )
    ) {
      throw new Error(
        `${{ [DirectoryEntryType.DIRECTORY]: 'Directory', [DirectoryEntryType.FILE]: 'File' }[type] || 'Entry'} does not exist`
      )
    }

    const sourcePath = this.buildAbsolutePath(sourceDirectoryPath, sourceName)
    const destPath = this.buildAbsolutePath(destDirectoryPath, destName)

    if (type === DirectoryEntryType.DIRECTORY) {
      await fs.promises.cp(sourcePath, destPath, { recursive: true })
    } else {
      await fs.promises.copyFile(sourcePath, destPath)
    }
  }

  copyFileFrom = async (
    absoluteSourcePath: string,
    destDirectoryPath: string,
    destName: string
  ) => {
    const destPath = this.buildAbsolutePath(destDirectoryPath, destName)
    await fs.promises.copyFile(absoluteSourcePath, destPath)
  }
}
