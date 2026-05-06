import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '@automapper/classes'
import { OcrModelType } from '../types/ocr-model-type.enum'
import { AccountDto } from '../../account/dto'

export class OcrModelDto {
  @ApiProperty({ type: String })
  @AutoMap()
  id: string

  @ApiProperty({ type: String })
  @AutoMap()
  name: string

  @ApiProperty({ type: String, nullable: true })
  @AutoMap()
  description: string | null

  @ApiProperty({ enum: OcrModelType })
  @AutoMap()
  type: OcrModelType

  @ApiProperty({ type: String, nullable: true })
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
