import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  Inject,
} from '@nestjs/common'
import { PathService } from 'src/common/services'

@Injectable()
export class ParsePathPipe implements PipeTransform<string, string> {
  constructor(
    @Inject('ROOT_PATH_SERVICE') private readonly pathService: PathService
  ) {}

  transform(value: string, _metadata: ArgumentMetadata) {
    return this.pathService.formatPath(value)
  }
}
