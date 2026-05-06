import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import { ImageEnhancementModelType } from '../types/image-enhancement-model-type.enum'
import { AccountDto } from '../../account/dto'

export class ImageEnhancementModelDto {
  @ApiProperty({
    type: String,
    example: '11111111-1111-1111-1111-111111111111',
  })
  @AutoMap()
  id: string

  @ApiProperty({ type: String, example: 'Binarization' })
  @AutoMap()
  name: string

  @ApiProperty({ type: String, nullable: true, example: 'A short description' })
  @AutoMap()
  description: string | null

  @ApiProperty({ enum: ImageEnhancementModelType })
  @AutoMap()
  type: ImageEnhancementModelType

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Script path (BUILTIN) or HuggingFace id (HUGGINGFACE)',
  })
  @AutoMap()
  reference: string | null

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  configFilePath: string | null

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  inputMapperFilePath: string | null

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  outputMapperFilePath: string | null

  @ApiProperty({ type: Date })
  @AutoMap(() => Date)
  createdAt: Date

  @ApiProperty({ type: Date })
  @AutoMap(() => Date)
  updatedAt: Date

  @ApiProperty({ type: () => AccountDto, nullable: true })
  @AutoMap(() => AccountDto)
  uploadedBy: AccountDto | null
}
