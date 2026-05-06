import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'

export class AiModelDto {
  @ApiProperty({ type: String, description: 'Model id (UUID)' })
  @AutoMap()
  id: string

  @ApiProperty({ type: String, description: 'Model name' })
  @AutoMap()
  name: string

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Script path or HF id (depending on model type)',
  })
  @AutoMap()
  path: string | null
}
