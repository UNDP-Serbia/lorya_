import { Injectable } from '@nestjs/common'
import { QueryRunner } from 'typeorm'
import { FileRepository } from './file.repository'
import { FileEntity } from './file.entity'
import { DirectoryService } from 'src/directory/directory.service'

@Injectable()
export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly directoryService: DirectoryService
  ) {}

  async findIdByDirAndName(
    inputDir: string,
    fileName: string
  ): Promise<string | null> {
    const directory = await this.directoryService.resolveByPath(inputDir)
    const file = await this.findOne({
      name: fileName,
      directoryId: directory?.id ?? null,
    })
    return file?.id ?? null
  }

  findAll() {
    return this.fileRepository.findAll()
  }

  findByDirectoryId(directoryId: string | null) {
    return this.fileRepository.findByDirectoryId(directoryId)
  }

  findOne(params: { id?: string; name?: string; directoryId?: string | null }) {
    return this.fileRepository.findOne(params)
  }

  create(data: Partial<FileEntity>) {
    return this.fileRepository.create(data)
  }

  createMany(data: Partial<FileEntity>[]) {
    return this.fileRepository.createMany(data)
  }

  createManyTransactional(
    queryRunner: QueryRunner,
    data: Partial<FileEntity>[]
  ) {
    return this.fileRepository.createManyTransactional(queryRunner, data)
  }

  save(data: Partial<FileEntity>) {
    return this.fileRepository.save(data)
  }

  findByIds(ids: string[]) {
    return this.fileRepository.findByIds(ids)
  }

  delete(id: string) {
    return this.fileRepository.delete(id)
  }
}
