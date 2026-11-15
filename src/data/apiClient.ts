import type { AreaOfInterest } from '../shared/types'

export interface ProblemDetails {
  status?: number
  title?: string
  detail?: string
  instance?: string
}

export class ApiError extends Error {
  readonly status: number | null
  readonly title: string
  readonly detail: string

  constructor(message: string, options: { status?: number | null; title?: string; detail?: string; cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.title = options.title ?? 'API request failed'
    this.detail = options.detail ?? message
  }
}

export function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

export function getApiBaseUrl(): string {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_BASE ?? 'http://localhost:8080')
}

export function serializeBbox(aoi: AreaOfInterest): string {
  const { west, south, east, north } = aoi.bounds
  return `${west},${south},${east},${north}`
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${normalizeApiBaseUrl(baseUrl)}${path.startsWith('/') ? path : `/${path}`}`)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function readProblem(response: Response): Promise<ProblemDetails> {
  try {
    return await response.json() as ProblemDetails
  } catch {
    return {}
  }
}

export class ApiClient {
  readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  constructor(baseUrl = getApiBaseUrl(), fetchImpl: typeof fetch = (...arguments_) => globalThis.fetch(...arguments_)) {
    this.baseUrl = normalizeApiBaseUrl(baseUrl)
    this.fetchImpl = fetchImpl
  }

  get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, query)
  }

  post<T>(path: string, body: unknown, query?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, query)
  }

  private async request<T>(path: string, init: RequestInit, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = buildUrl(this.baseUrl, path, query)
    let response: Response
    try {
      const fetchRequest = this.fetchImpl
      response = await fetchRequest(url, init)
    } catch (cause) {
      throw new ApiError('Unable to reach the wildfire API.', { cause })
    }

    if (!response.ok) {
      const problem = await readProblem(response)
      const status = problem.status ?? response.status
      const title = problem.title ?? (response.statusText || 'API request failed')
      const detail = problem.detail ?? `${title} (${status})`
      throw new ApiError(detail, { status, title, detail })
    }

    try {
      return await response.json() as T
    } catch (cause) {
      throw new ApiError('The wildfire API returned invalid JSON.', { status: response.status, cause })
    }
  }
}
