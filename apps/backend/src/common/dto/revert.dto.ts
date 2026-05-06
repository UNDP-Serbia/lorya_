import { IsNotEmpty, IsString } from 'class-validator'

export class RevertDto {
  @IsString()
  @IsNotEmpty()
  inputDir: string

  @IsString()
  @IsNotEmpty()
  fileName: string
}
