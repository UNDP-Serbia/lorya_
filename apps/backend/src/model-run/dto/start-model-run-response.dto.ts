import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'

export class StartModelRunResponseDto {
  @AutoMap()
  @ApiProperty({
    type: String,
    format: 'uuid',
    description:
      'ModelRun.id — pass to processModel calls and complete endpoint',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  id: string

  @AutoMap()
  @ApiProperty({
    type: Number,
    description:
      'Per-model sequence number (1-based) for human display, e.g. "Run #12"',
    example: 12,
  })
  runId: number
}
