import { DirectoryEntryDto } from '../dto'
import { DirectoryEntryType } from '../types'

const buildDirectoryTree = (
  list: DirectoryEntryDto[],
  rootPath: string = '/'
): DirectoryEntryDto[] => {
  return list
    .filter(item => item.path === rootPath)
    .map(item => ({
      ...item,
      children:
        item.type === DirectoryEntryType.DIRECTORY
          ? buildDirectoryTree(
              list,
              `${item.path}${item.path !== '/' ? '/' : ''}${item.name}`
            )
          : undefined,
    }))
}

export const directoryEntryHelper = {
  buildDirectoryTree,
}
