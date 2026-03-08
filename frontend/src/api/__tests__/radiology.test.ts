import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { radiologyApi } from '../radiology'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('radiologyApi', () => {
  it('getOrders sends GET /radiology/orders with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31', status: 1, modality: 'XR', pageIndex: 0, pageSize: 20 }
    await radiologyApi.getOrders(params)
    expect(client.get).toHaveBeenCalledWith('/radiology/orders', { params })
  })

  it('getOrders sends GET /radiology/orders without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await radiologyApi.getOrders()
    expect(client.get).toHaveBeenCalledWith('/radiology/orders', { params: undefined })
  })

  it('getOrderById sends GET /radiology/orders/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'r1' } })
    await radiologyApi.getOrderById('r1')
    expect(client.get).toHaveBeenCalledWith('/radiology/orders/r1')
  })

  it('createOrder sends POST /radiology/orders', async () => {
    const data = { examinationId: 'e1', modality: 'XR', bodyPart: 'chest', clinicalInfo: 'cough' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'r1' } })
    await radiologyApi.createOrder(data)
    expect(client.post).toHaveBeenCalledWith('/radiology/orders', data)
  })

  it('enterResult sends POST /radiology/orders/:id/result', async () => {
    const data = { result: 'No abnormality', conclusion: 'Normal' }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await radiologyApi.enterResult('r1', data)
    expect(client.post).toHaveBeenCalledWith('/radiology/orders/r1/result', data)
  })

  it('approve sends POST /radiology/orders/:id/approve', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await radiologyApi.approve('r1')
    expect(client.post).toHaveBeenCalledWith('/radiology/orders/r1/approve')
  })

  it('getTemplates sends GET /radiology/templates/:modality', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await radiologyApi.getTemplates('XR')
    expect(client.get).toHaveBeenCalledWith('/radiology/templates/XR')
  })

  it('getReport sends GET /radiology/reports with params', async () => {
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31' }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await radiologyApi.getReport(params)
    expect(client.get).toHaveBeenCalledWith('/radiology/reports', { params })
  })
})
