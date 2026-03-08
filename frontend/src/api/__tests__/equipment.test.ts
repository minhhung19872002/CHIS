import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { equipmentApi } from '../equipment'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('equipmentApi', () => {
  it('getList sends GET /equipment with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', category: 'medical', status: 1, pageIndex: 0, pageSize: 20 }
    await equipmentApi.getList(params)
    expect(client.get).toHaveBeenCalledWith('/equipment', { params })
  })

  it('getList sends GET /equipment without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await equipmentApi.getList()
    expect(client.get).toHaveBeenCalledWith('/equipment', { params: undefined })
  })

  it('getById sends GET /equipment/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'eq1', name: 'X-Ray Machine' } })
    const result = await equipmentApi.getById('eq1')
    expect(client.get).toHaveBeenCalledWith('/equipment/eq1')
    expect(result.data.name).toBe('X-Ray Machine')
  })

  it('create sends POST /equipment', async () => {
    const data = { code: 'EQ001', name: 'X-Ray Machine', category: 'medical' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'eq1' } })
    await equipmentApi.create(data)
    expect(client.post).toHaveBeenCalledWith('/equipment', data)
  })

  it('update sends PUT /equipment/:id', async () => {
    const data = { name: 'Updated Equipment' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await equipmentApi.update('eq1', data)
    expect(client.put).toHaveBeenCalledWith('/equipment/eq1', data)
  })

  it('transfer sends POST /equipment/transfers', async () => {
    const data = { equipmentId: 'eq1', fromLocation: 'Room A', toLocation: 'Room B', reason: 'Relocation' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'tr1' } })
    await equipmentApi.transfer(data)
    expect(client.post).toHaveBeenCalledWith('/equipment/transfers', data)
  })

  it('getTransfers sends GET /equipment/transfers with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { pageIndex: 0, pageSize: 20 }
    await equipmentApi.getTransfers(params)
    expect(client.get).toHaveBeenCalledWith('/equipment/transfers', { params })
  })

  it('dispose sends POST /equipment/disposals', async () => {
    const data = { equipmentId: 'eq1', reason: 'End of life', method: 'Recycled' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'dis1' } })
    await equipmentApi.dispose(data)
    expect(client.post).toHaveBeenCalledWith('/equipment/disposals', data)
  })

  it('getDisposals sends GET /equipment/disposals', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { pageIndex: 0, pageSize: 20 }
    await equipmentApi.getDisposals(params)
    expect(client.get).toHaveBeenCalledWith('/equipment/disposals', { params })
  })

  it('getTrackingBook sends GET /equipment/tracking-book', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await equipmentApi.getTrackingBook({ year: 2024 })
    expect(client.get).toHaveBeenCalledWith('/equipment/tracking-book', { params: { year: 2024 } })
  })

  it('getStatistics sends GET /equipment/statistics', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await equipmentApi.getStatistics()
    expect(client.get).toHaveBeenCalledWith('/equipment/statistics')
  })
})
