import { useQuery } from '@tanstack/react-query'
import { PostOcrCorrectionQueryKeys } from './post-ocr-correction.keys'
import {
  postOcrCorrectionEndpoints,
  type PostOcrCorrectionResultsResponseDto,
} from '../../api'

export const useFilePostOcrCorrectionResults = (fileId: string | null) => {
  return useQuery<PostOcrCorrectionResultsResponseDto, Error>({
    queryKey: PostOcrCorrectionQueryKeys.results(fileId!),
    queryFn: async () => {
      return await postOcrCorrectionEndpoints.getResults(fileId!)
    },
    enabled: !!fileId,
  })
}
