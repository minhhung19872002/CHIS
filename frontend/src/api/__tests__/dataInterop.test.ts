import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { dataInteropApi } from '../dataInterop'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('dataInteropApi', () => {
  it('getBhytSyncStatus sends GET /data-interop/bhyt/status', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { status: 'synced' } })
    await dataInteropApi.getBhytSyncStatus()
    expect(client.get).toHaveBeenCalledWith('/data-interop/bhyt/status')
  })

  it('syncBhytClaims sends POST /data-interop/bhyt/sync with params', async () => {
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31' }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await dataInteropApi.syncBhytClaims(params)
    expect(client.post).toHaveBeenCalledWith('/data-interop/bhyt/sync', params)
  })

  it('getBhytClaims sends GET /data-interop/bhyt/claims with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31', status: 'pending', pageIndex: 0, pageSize: 20 }
    await dataInteropApi.getBhytClaims(params)
    expect(client.get).toHaveBeenCalledWith('/data-interop/bhyt/claims', { params })
  })

  it('checkInsuranceCard sends GET /data-interop/bhyt/check-card/:number', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { valid: true } })
    await dataInteropApi.checkInsuranceCard('DN4010012345678')
    expect(client.get).toHaveBeenCalledWith('/data-interop/bhyt/check-card/DN4010012345678')
  })

  it('getHsskStatus sends GET /data-interop/hssk/status', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await dataInteropApi.getHsskStatus()
    expect(client.get).toHaveBeenCalledWith('/data-interop/hssk/status')
  })

  it('syncHssk sends POST /data-interop/hssk/sync', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await dataInteropApi.syncHssk()
    expect(client.post).toHaveBeenCalledWith('/data-interop/hssk/sync')
  })

  it('getV20Status sends GET /data-interop/v20/status', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await dataInteropApi.getV20Status()
    expect(client.get).toHaveBeenCalledWith('/data-interop/v20/status')
  })

  it('syncV20 sends POST /data-interop/v20/sync with params', async () => {
    const params = { month: 1, year: 2024 }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await dataInteropApi.syncV20(params)
    expect(client.post).toHaveBeenCalledWith('/data-interop/v20/sync', params)
  })

  it('getSyncHistory sends GET /data-interop/sync-history with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { jobType: 'bhyt', pageIndex: 0, pageSize: 20 }
    await dataInteropApi.getSyncHistory(params)
    expect(client.get).toHaveBeenCalledWith('/data-interop/sync-history', { params })
  })

  it('getSyncHistory sends GET /data-interop/sync-history without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await dataInteropApi.getSyncHistory()
    expect(client.get).toHaveBeenCalledWith('/data-interop/sync-history', { params: undefined })
  })
})
