import axios, { AxiosHeaders, type AxiosResponse, isAxiosError } from 'axios'
import { Configuration, TransactionsApi } from '@/generated/api'
import { createClient } from '@/lib/supabase/client'

export type TransactionCategory = {
  id: string
  name: string
  description: string
}

export type TransactionResponse = {
  id: string
  source: string
  transactionDate: string
  description: string
  amount: number
  currencyCode: string
  categoryId: string | null
  category: TransactionCategory | null
  userId: string
  createdAtUtc: string
  updatedAtUtc: string
}

export type ImportTransactionsResponse = {
  message: string
  parsed: number
  imported: number
  skippedDuplicates: number
}

export type CsvFormat = 'Handelsbanken' | 'SasMastercard'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5205'

const apiClient = axios.create()

apiClient.interceptors.request.use(async (config) => {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('Authorization', `Bearer ${session.access_token}`)
    config.headers = headers
  }

  return config
})

const transactionsApi = new TransactionsApi(
  new Configuration({
    basePath: apiBaseUrl,
  }),
  apiBaseUrl,
  apiClient,
)

async function getCurrentUserId() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.id) {
    throw new Error('User is not authenticated.')
  }

  return user.id
}

function throwApiError(message: string, error: unknown): never {
  if (isAxiosError(error)) {
    const apiMessage =
      typeof error.response?.data === 'object' && error.response?.data && 'error' in error.response.data
        ? String(error.response.data.error)
        : error.message

    throw new Error(`${message} ${apiMessage}`.trim())
  }

  if (error instanceof Error) {
    throw new Error(`${message} ${error.message}`.trim())
  }

  throw new Error(message)
}

export async function getTransactions() {
  const userId = await getCurrentUserId()

  try {
    const response = (await transactionsApi.getTransactions(userId)) as AxiosResponse<TransactionResponse[]>
    return response.data
  } catch (error) {
    return throwApiError('Could not load transactions.', error)
  }
}

export async function importTransactions(input: { format: CsvFormat; file: File }) {
  const userId = await getCurrentUserId()

  try {
    const response = (await transactionsApi.importTransactions(input.format, userId, input.file)) as AxiosResponse<ImportTransactionsResponse>
    return response.data
  } catch (error) {
    return throwApiError('Could not import transactions.', error)
  }
}