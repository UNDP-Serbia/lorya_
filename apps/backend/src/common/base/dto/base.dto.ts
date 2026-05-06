import { AutoMap } from '@automapper/classes'
import { ApiProperty } from '@nestjs/swagger'

export class BaseDto {
  @ApiProperty({
    type: String,
    description: 'UUID',
    example: '222cfb60-9678-4d0e-bdba-02eb9091b32b',
  })
  @AutoMap()
  id: string

  @ApiProperty()
  @AutoMap()
  createdAt: Date

  @ApiProperty()
  @AutoMap()
  updatedAt: Date
}
