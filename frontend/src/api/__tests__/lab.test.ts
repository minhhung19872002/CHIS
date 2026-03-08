import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { labApi } from '../lab'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('labApi', () => {
  it('getOrders sends GET /lab/orders with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31', status: 1, pageIndex: 0, pageSize: 20 }
    await labApi.getOrders(params)
    expect(client.get).toHaveBeenCalledWith('/lab/orders', { params })
  })

  it('getOrders sends GET /lab/orders without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await labApi.getOrders()
    expect(client.get).toHaveBeenCalledWith('/lab/orders', { params: undefined })
  })

  it('getOrderById sends GET /lab/orders/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'o1' } })
    await labApi.getOrderById('o1')
    expect(client.get).toHaveBeenCalledWith('/lab/orders/o1')
  })

  it('createOrder sends POST /lab/orders', async () => {
    const data = { examinationId: 'e1', testIds: ['t1', 't2'] }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'o1' } })
    await labApi.createOrder(data)
    expect(client.post).toHaveBeenCalledWith('/lab/orders', data)
  })

  it('enterResults sends POST /lab/orders/:id/results', async () => {
    const results = [{ itemId: 'i1', result: '5.5', note: 'normal' }]
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await labApi.enterResults('o1', results)
    expect(client.post).toHaveBeenCalledWith('/lab/orders/o1/results', { results })
  })

  it('approveResults sends POST /lab/orders/:id/approve', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await labApi.approveResults('o1')
    expect(client.post).toHaveBeenCalledWith('/lab/orders/o1/approve')
  })

  it('getTestCatalog sends GET /lab/tests', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await labApi.getTestCatalog()
    expect(client.get).toHaveBeenCalledWith('/lab/tests')
  })

  it('getReferenceValues sends GET /lab/tests/:id/reference-values', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await labApi.getReferenceValues('t1')
    expect(client.get).toHaveBeenCalledWith('/lab/tests/t1/reference-values')
  })

  it('getReport sends GET /lab/reports with params', async () => {
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31', groupBy: 'test' }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await labApi.getReport(params)
    expect(client.get).toHaveBeenCalledWith('/lab/reports', { params })
  })
})
