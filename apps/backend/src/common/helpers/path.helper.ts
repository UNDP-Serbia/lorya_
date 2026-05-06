export const pathHelpers = {
  formatPath: (fileSystemPath?: string | null) => {
    if (!fileSystemPath || typeof fileSystemPath !== 'string') {
      return ''
    }
    return fileSystemPath.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim()
  },
}
