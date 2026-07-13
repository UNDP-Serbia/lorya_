import { useQuery } from '@tanstack/react-query'
import { OcrQueryKeys } from './ocr.keys'
import { ocrEndpoints, type OcrResultsResponseDto } from '../../api'

export const useFileOcrResults = (fileId: string | null) => {
  return useQuery<OcrResultsResponseDto, Error>({
    queryKey: OcrQueryKeys.results(fileId!),
    queryFn: async () => {
      return await ocrEndpoints.getResults(fileId!)
    },
    enabled: !!fileId,
  })
}
