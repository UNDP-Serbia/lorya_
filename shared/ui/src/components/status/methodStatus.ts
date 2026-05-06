export type MethodStatus = 'idle' | 'running' | 'done' | 'failed'

export const METHOD_STATUS_CONFIG = {
  idle: {
    label: 'RUN',
    strong: {
      borderColor: 'rgba(25, 118, 210, 0.5)',
      color: 'rgba(25, 118, 210, 1)',
      backgroundColor: 'rgba(25, 118, 210, 0.04)',
    },
    soft: {
      bg: '#E7F3FF',
      accent: '#BCDDFF',
    },
  },

  running: {
    label: 'IN PROGRESS',
    strong: {
      borderColor: '#FFB020',
      color: '#FFB020',
      backgroundColor: 'rgba(255, 176, 32, 0.08)',
    },
    soft: {
      bg: 'rgba(255, 176, 32, 0.08)',
      accent: '#FFB020',
    },
  },

  done: {
    label: 'DONE',
    strong: {
      borderColor: '#2FB5A3',
      color: '#2FB5A3',
      backgroundColor: 'rgba(47, 181, 163, 0.1)',
    },
    soft: {
      bg: 'rgba(47, 181, 163, 0.08)',
      accent: '#2FB5A3',
    },
  },

  failed: {
    label: 'FAILED',
    strong: {
      borderColor: '#FF5630',
      color: '#FF5630',
      backgroundColor: 'rgba(255, 86, 48, 0.08)',
    },
    soft: {
      bg: 'rgba(255, 86, 48, 0.08)',
      accent: '#FF5630',
    },
  },
} as const
