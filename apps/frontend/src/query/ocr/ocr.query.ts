import { useQuery } from '@tanstack/react-query'
import { OcrQueryKeys } from './ocr.keys'
import { ocrEndpoints, type OcrSegmentData } from '../../api'

export const useFileOcrResults = (fileId: string | null) => {
  return useQuery<OcrSegmentData[], Error>({
    queryKey: OcrQueryKeys.results(fileId!),
    queryFn: async () => {
      const res = await ocrEndpoints.getResults(fileId!)
      return res.data
    },
    enabled: !!fileId,
  })
}
