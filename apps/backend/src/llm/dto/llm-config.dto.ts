import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LlmConfigDto {
  @ApiProperty({ type: String, example: 'gpt-4o' })
  model: string

  @ApiProperty({ type: String, example: 'Read the text in this image.' })
  defaultPrompt: string

  @ApiPropertyOptional({
    type: String,
    example: 'Return a single JSON object with fields: lang, script, lines ...',
  })
  outputFormatPrompt?: string

  @ApiPropertyOptional({ type: String, example: 'https://api.example.com' })
  apiBase?: string

  @ApiPropertyOptional({
    type: Object,
    example: { temperature: 0.2, max_tokens: 4096 },
  })
  parameters?: Record<string, unknown>
}
