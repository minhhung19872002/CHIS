import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { billingApi } from '../billing'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('billingApi', () => {
  it('search sends GET /billing with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', pageSize: 20 }
    await billingApi.search(params as any)
    expect(client.get).toHaveBeenCalledWith('/billing', { params })
  })

  it('getById sends GET /billing/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: '1' } })
    await billingApi.getById('1')
    expect(client.get).toHaveBeenCalledWith('/billing/1')
  })

  it('calculateFees sends GET /billing/calculate/:examinationId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { totalAmount: 500000 } })
    await billingApi.calculateFees('exam1')
    expect(client.get).toHaveBeenCalledWith('/billing/calculate/exam1')
  })

  it('confirmInsurance sends POST', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await billingApi.confirmInsurance('1')
    expect(client.post).toHaveBeenCalledWith('/billing/1/confirm-insurance')
  })

  it('collectPayment sends POST with data', async () => {
    const data = { paymentMethod: 'TienMat', amount: 100000 }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await billingApi.collectPayment('1', data)
    expect(client.post).toHaveBeenCalledWith('/billing/1/collect', data)
  })

  it('cancelPayment sends POST with reason', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await billingApi.cancelPayment('1', 'Nhap sai')
    expect(client.post).toHaveBeenCalledWith('/billing/1/cancel', { reason: 'Nhap sai' })
  })

  it('getDailyReport sends GET with date param', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await billingApi.getDailyReport('2024-01-15')
    expect(client.get).toHaveBeenCalledWith('/billing/daily-report', { params: { date: '2024-01-15' } })
  })

  it('getInsuranceReport sends GET with date range', async () => {
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31' }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await billingApi.getInsuranceReport(params)
    expect(client.get).toHaveBeenCalledWith('/billing/insurance-report', { params })
  })
})
