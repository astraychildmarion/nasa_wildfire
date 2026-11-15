import { describe, expect, it, vi } from 'vitest'
import { TEST_AOI } from './mockHistoricalData'
import { ApiClient, normalizeApiBaseUrl, serializeBbox } from './apiClient'

describe('ApiClient', () => {
  it('normalizes trailing slashes and serializes bbox in west,south,east,north order', () => {
    expect(normalizeApiBaseUrl('https://example.test///')).toBe('https://example.test')
    expect(serializeBbox(TEST_AOI)).toBe('-125,32,-114,42')
  })

  it('builds GET requests with encoded query parameters', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    const client = new ApiClient('https://example.test/', fetchImpl)

    await expect(client.get('/api/activity', { bbox: '-125,32,-114,42' })).resolves.toEqual({ ok: true })
    expect(fetchImpl).toHaveBeenCalledWith('https://example.test/api/activity?bbox=-125%2C32%2C-114%2C42', { method: 'GET' })
  })

  it('sends JSON POST requests', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ source: 'model-api' }), { status: 200 }))
    const client = new ApiClient('https://example.test', fetchImpl)
    const body = { bbox: [-125, 32, -114, 42], days: 7 }

    await client.post('/api/forecast', body)
    expect(fetchImpl).toHaveBeenCalledWith('https://example.test/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  })

  it('preserves Problem Details fields on HTTP errors', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ status: 400, title: 'Bad Request', detail: 'Invalid bbox.' }), { status: 400, headers: { 'Content-Type': 'application/problem+json' } }))

    const request = new ApiClient('https://example.test', fetchImpl).get('/api/activity')
    await expect(request).rejects.toMatchObject({ status: 400, title: 'Bad Request', detail: 'Invalid bbox.' })
  })

  it('reports network failures without fabricating a response status', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline'))

    const request = new ApiClient('https://example.test', fetchImpl).get('/api/health')
    await expect(request).rejects.toMatchObject({ status: null, detail: 'Unable to reach the wildfire API.' })
  })

  it('rejects invalid JSON from successful responses', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response('not-json', { status: 200 }))

    await expect(new ApiClient('https://example.test', fetchImpl).get('/api/health')).rejects.toThrow('invalid JSON')
  })
})
