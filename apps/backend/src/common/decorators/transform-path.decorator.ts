import { Transform } from 'class-transformer'
import { pathHelpers } from '../helpers'

export const TransformPath = () => {
  return Transform(({ value }) => pathHelpers.formatPath(value))
}
