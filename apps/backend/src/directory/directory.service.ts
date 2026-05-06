import { Injectable } from '@nestjs/common'
import { DirectoryRepository } from './directory.repository'
import { DirectoryEntity } from './directory.entity'
import { pathHelpers } from 'src/common/helpers/path.helper'

@Injectable()
export class DirectoryService {
  constructor(private readonly directoryRepository: DirectoryRepository) {}

  findAll() {
    return this.directoryRepository.findAll()
  }

  findByParentId(parentId: string | null) {
    return this.directoryRepository.findByParentId(parentId)
  }

  findOne(params: { id?: string; name?: string; parentId?: string | null }) {
    return this.directoryRepository.findOne(params)
  }

  async resolveByPath(relativePath: string): Promise<DirectoryEntity | null> {
    const formatted = pathHelpers.formatPath(relativePath)
    if (!formatted || formatted === '') {
      return null
    }
    const segments = formatted.split('/').filter(Boolean)
    if (segments.length === 0) return null
    return this.directoryRepository.findByPath(segments)
  }

  async buildRelativePath(directory: DirectoryEntity | null): Promise<string> {
    if (!directory) return '/'
    const segments: string[] = []
    let current: DirectoryEntity | null = directory
    while (current) {
      segments.unshift(current.name)
      current = current.parentId
        ? await this.directoryRepository.findOne({ id: current.parentId })
        : null
    }
    return '/' + segments.join('/')
  }

  create(data: Partial<DirectoryEntity>) {
    return this.directoryRepository.create(data)
  }

  save(data: Partial<DirectoryEntity>) {
    return this.directoryRepository.save(data)
  }

  delete(id: string) {
    return this.directoryRepository.delete(id)
  }
}
