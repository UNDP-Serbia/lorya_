import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import { ActivityDto } from './activity.dto'

export class ActivityDetailDto extends ActivityDto {
  @ApiProperty({ type: Number, nullable: true })
  @AutoMap()
  exitCode: number | null

  @ApiProperty({ type: Object, nullable: true })
  metadata: Record<string, unknown> | null
}
