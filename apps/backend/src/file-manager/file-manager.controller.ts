import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Body,
  Delete,
  Put,
  Patch,
  Inject,
  Param,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'
import { FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import * as fs from 'fs'
import archiver from 'archiver'
import {
  DirectoryEntryDto,
  CreateDirectoryDto,
  DeleteEntriesDto,
  DownloadEntriesDto,
  UploadFilesDto,
} from './dto'
import { RevertDto } from '../common/dto/revert.dto'
import { Payload } from 'src/common/decorators/payload.decorator'
import { JwtPayload } from 'src/common/types'
import { FileManagerService } from './file-manager.service'
import { ParsePathPipe } from '../common/pipes'
import { RenameEntriesDto } from './dto/rename-entries.dto'
import { MoveEntriesDto } from './dto/move-entires.dto'
import * as path from 'path'
import { DirectoryEntryType } from './types'

@Controller()
@ApiTags('File Manager')
@ApiBearerAuth('bearerToken')
export class FileManagerController {
  constructor(
    private readonly fileManagerService: FileManagerService,
    @Inject('ROOT_PATH') private readonly rootPath: string
  ) {}

  @ApiOperation({ summary: 'List entries in a directory' })
  @ApiQuery({
    type: String,
    name: 'path',
    description: 'The name of the directory to list',
    required: false,
  })
  @ApiOkResponse({
    description: 'The list of entries in the directory',
    type: () => DirectoryEntryDto,
    isArray: true,
  })
  @Get('entries')
  async getEntries(
    @Query('path', ParsePathPipe) directoryPath?: string
  ): Promise<DirectoryEntryDto[]> {
    return this.fileManagerService.getEntries(directoryPath)
  }

  @ApiOperation({ summary: 'Rename one or more entries' })
  @ApiBody({
    type: () => RenameEntriesDto,
    description:
      'Array of entries to rename (supports both single and multiple entries)',
  })
  @ApiOkResponse({
    description: 'Renamed entries',
    type: () => DirectoryEntryDto,
    isArray: true,
  })
  @Put('entries')
  async renameEntries(@Body() body: RenameEntriesDto) {
    return this.fileManagerService.renameEntries(...body.entries)
  }

  @ApiOperation({ summary: 'Move one or more entries' })
  @ApiBody({
    type: () => MoveEntriesDto,
    description:
      'Array of entries to move (supports both single and multiple entries)',
  })
  @ApiOkResponse({
    description: 'Moved entries',
    type: () => DirectoryEntryDto,
    isArray: true,
  })
  @Patch('entries')
  async moveEntries(@Body() body: MoveEntriesDto) {
    return this.fileManagerService.moveEntries(...body.entries)
  }

  @ApiOperation({ summary: 'Delete one or more entries' })
  @ApiBody({
    type: () => DeleteEntriesDto,
    description:
      'Array of entries to delete (supports both single and multiple entries)',
  })
  @ApiOkResponse({
    description: 'Deleted entries',
    type: () => DirectoryEntryDto,
    isArray: true,
  })
  @Delete('entries')
  async deleteEntries(@Body() body: DeleteEntriesDto) {
    return this.fileManagerService.deleteEntries(...body.entries)
  }

  @ApiOperation({ summary: 'Download one or more entries' })
  @ApiBody({
    type: () => DownloadEntriesDto,
    description:
      'Array of entries to download (single file, folder, or multiple)',
  })
  @ApiOkResponse({
    description: 'File or zip archive download',
  })
  @Post('entries/download')
  @HttpCode(HttpStatus.OK)
  async downloadEntries(
    @Body() body: DownloadEntriesDto,
    @Res() res: Response
  ) {
    const resolved = this.fileManagerService.resolveDownloadEntries(
      body.entries
    )

    if (resolved.length === 1) {
      const entry = resolved[0]

      if (entry.type === DirectoryEntryType.FILE) {
        res.set({
          'Content-Type': entry.contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(entry.name)}"`,
        })
        fs.createReadStream(entry.absolutePath).pipe(res)
        return
      }

      if (entry.type === DirectoryEntryType.DIRECTORY) {
        res.set({
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(entry.name)}.zip"`,
        })
        const archive = archiver('zip', { zlib: { level: 5 } })
        archive.pipe(res)
        archive.directory(entry.absolutePath, false)
        await archive.finalize()
        return
      }
    }

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="Archive.zip"',
    })

    const archive = archiver('zip', { zlib: { level: 5 } })
    archive.pipe(res)

    for (const entry of resolved) {
      if (entry.type === DirectoryEntryType.FILE) {
        archive.file(entry.absolutePath, { name: entry.name })
      } else if (entry.type === DirectoryEntryType.DIRECTORY) {
        archive.directory(entry.absolutePath, entry.name)
      }
    }

    await archive.finalize()
  }

  @ApiOperation({ summary: 'Reset a file to its original state' })
  @ApiBody({
    type: () => RevertDto,
    description: 'The directory and file name to reset',
  })
  @ApiOkResponse({
    description: 'File reset successfully',
  })
  @Post('entries/reset')
  @HttpCode(HttpStatus.OK)
  async resetFile(
    @Body() body: RevertDto,
    @Payload() payload: JwtPayload
  ): Promise<{ success: boolean }> {
    return this.fileManagerService.resetFile(
      body.inputDir,
      body.fileName,
      payload.sub
    )
  }

  @ApiOperation({ summary: 'Create a new directory' })
  @ApiBody({
    type: () => CreateDirectoryDto,
    description:
      'The path to the directory to create and the name of the directory',
  })
  @ApiOkResponse({
    description: 'Created directory',
    type: () => DirectoryEntryDto,
  })
  @Post('entries/directory')
  @HttpCode(HttpStatus.OK)
  async createDirectory(@Body() body: CreateDirectoryDto) {
    return this.fileManagerService.createDirectory(body.path, body.name)
  }

  @ApiOperation({ summary: 'Upload a files to a dynamic path' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: () => UploadFilesDto,
    description:
      'The path to the directory to upload files and the files to upload',
  })
  @ApiOkResponse({
    description: 'Uploaded files info',
    type: () => DirectoryEntryDto,
    isArray: true,
  })
  @Post('entries/files')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('files', undefined, {
      fileFilter: (_req, file, cb) => {
        const allowedExt = /\.(pdf|png|jpe?g|gif|webp|svg)$/i
        const extname = allowedExt.test(
          path.extname(file.originalname).toLowerCase()
        )
        const isPdf = file.mimetype === 'application/pdf'
        const isImage = file.mimetype.startsWith('image/')
        if ((isPdf || isImage) && extname) {
          return cb(null, true)
        }
        return cb(
          new BadRequestException('Only PDF and image files are allowed'),
          false
        )
      },
    })
  )
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('path', ParsePathPipe) path: string
  ): Promise<DirectoryEntryDto[]> {
    await this.fileManagerService.uploadFiles(path, files)
    return files.map(
      file =>
        ({
          type: DirectoryEntryType.FILE,
          path: `/${path}`,
          name: file.filename,
        }) as DirectoryEntryDto
    )
  }

  @ApiOperation({ summary: 'Export file OCR results as ALTO XML' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The UUID of the file to export',
  })
  @ApiOkResponse({
    description: 'ALTO XML file download',
  })
  @Get('entries/files/:id/export/alto')
  async exportAlto(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<string> {
    const { xmlContent, filename } =
      await this.fileManagerService.exportAlto(id)

    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="${filename}.xml"`,
    })

    return xmlContent
  }
}
