import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../http/fetchWithResilience', () => ({
  fetchWithResilience: vi.fn()
}))

vi.mock('../logging/logger', () => ({
  logger: {
    error: vi.fn()
  }
}))

vi.mock('../../config/initiativeResolver', () => ({
  INITIATIVE_NAME: 'bonus_decoder'
}))

describe('requestExport', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns json when fetch succeeds and response is ok', async () => {
    const { fetchWithResilience } = await import('../http/fetchWithResilience')
    const { requestExport } = await import('./exportClient')

    ;(fetchWithResilience as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response(JSON.stringify({ requestId: 'id', status: 'accepted' }), {
        status: 200
      })
    )

    const res = await requestExport()

    expect(res).toEqual({ requestId: 'id', status: 'accepted' })
    expect(fetchWithResilience).toHaveBeenCalledWith('/api/export', expect.any(Object))
  })

  it('returns null and logs when response is not ok', async () => {
    const { fetchWithResilience } = await import('../http/fetchWithResilience')
    const { logger } = await import('../logging/logger')
    const { requestExport } = await import('./exportClient')

    ;(fetchWithResilience as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('no', { status: 500 })
    )

    const res = await requestExport()

    expect(res).toBeNull()
    expect(logger.error).toHaveBeenCalled()
  })

  it('returns null and logs when fetch throws', async () => {
    const { fetchWithResilience } = await import('../http/fetchWithResilience')
    const { logger } = await import('../logging/logger')
    const { requestExport } = await import('./exportClient')

    ;(fetchWithResilience as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('boom')
    )

    const res = await requestExport()

    expect(res).toBeNull()
    expect(logger.error).toHaveBeenCalledWith('boom')
  })

  it('returns null and logs generic message when thrown value is not an Error', async () => {
    const { fetchWithResilience } = await import('../http/fetchWithResilience')
    const { logger } = await import('../logging/logger')
    const { requestExport } = await import('./exportClient')

    ;(fetchWithResilience as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      'boom'
    )

    const res = await requestExport()

    expect(res).toBeNull()
    expect(logger.error).toHaveBeenCalledWith('Export failed')
  })
})
