'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { importTransactions, getTransactions, type CsvFormat } from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'

export function useTransactions(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.transactions.list(),
    queryFn: getTransactions,
    enabled,
  })
}

export function useImportTransactions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ format, file }: { format: CsvFormat; file: File }) =>
      importTransactions({ format, file }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all })
    },
    onError: (error) => {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Could not import transactions.',
        variant: 'destructive',
      })
    },
  })
}