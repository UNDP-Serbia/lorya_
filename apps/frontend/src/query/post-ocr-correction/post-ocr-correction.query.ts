import { useQuery } from '@tanstack/react-query'
import { PostOcrCorrectionQueryKeys } from './post-ocr-correction.keys'
import {
  postOcrCorrectionEndpoints,
  type PostOcrCorrectionSegmentData,
} from '../../api'

export const useFilePostOcrCorrectionResults = (fileId: string | null) => {
  return useQuery<PostOcrCorrectionSegmentData[], Error>({
    queryKey: PostOcrCorrectionQueryKeys.results(fileId!),
    queryFn: async () => {
      const res = await postOcrCorrectionEndpoints.getResults(fileId!)
      return res.data
    },
    enabled: !!fileId,
  })
}
