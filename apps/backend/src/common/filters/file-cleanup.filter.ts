import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import * as fs from 'fs'

@Catch(HttpException)
export class FileCleanupFilter implements ExceptionFilter {
  private readonly logger = new Logger(FileCleanupFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const file = request.file as Express.Multer.File | undefined

    if (file?.path && fs.existsSync(file.path)) {
      try {
        this.logger.log('Deleting uploaded file:', file.path)
        fs.unlinkSync(file.path)
      } catch (error) {
        this.logger.error('Failed to delete uploaded file:', error)
      }
    }

    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()
    response.status(status).json(exceptionResponse)
  }
}
