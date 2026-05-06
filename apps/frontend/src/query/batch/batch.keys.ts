const ALL = ['all', 'batch'] as const

export const BatchMutationKeys = {
  all: ALL,
  validate: [...ALL, 'validate'],
}
