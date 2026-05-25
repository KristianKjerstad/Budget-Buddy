export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: () => ['transactions', 'list'] as const,
  },
} as const