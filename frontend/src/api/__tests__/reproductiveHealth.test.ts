import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { reproductiveHealthApi } from '../reproductiveHealth'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('reproductiveHealthApi', () => {
  it('getPrenatalRecords sends GET /reproductive-health/prenatal with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', riskLevel: 2, status: 1, pageIndex: 0, pageSize: 20 }
    await reproductiveHealthApi.getPrenatalRecords(params)
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/prenatal', { params })
  })

  it('getPrenatalById sends GET /reproductive-health/prenatal/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'pn1' } })
    await reproductiveHealthApi.getPrenatalById('pn1')
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/prenatal/pn1')
  })

  it('createPrenatal sends POST /reproductive-health/prenatal', async () => {
    const data = { patientId: 'p1', gestationalAge: 12, expectedDueDate: '2024-09-01' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'pn1' } })
    await reproductiveHealthApi.createPrenatal(data)
    expect(client.post).toHaveBeenCalledWith('/reproductive-health/prenatal', data)
  })

  it('addPrenatalVisit sends POST /reproductive-health/prenatal/:id/visits', async () => {
    const data = { visitDate: '2024-03-01', gestationalWeek: 20, weight: 60 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'v1' } })
    await reproductiveHealthApi.addPrenatalVisit('pn1', data)
    expect(client.post).toHaveBeenCalledWith('/reproductive-health/prenatal/pn1/visits', data)
  })

  it('getDeliveries sends GET /reproductive-health/deliveries with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31', pageIndex: 0, pageSize: 20 }
    await reproductiveHealthApi.getDeliveries(params)
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/deliveries', { params })
  })

  it('getDeliveries sends GET without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await reproductiveHealthApi.getDeliveries()
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/deliveries', { params: undefined })
  })

  it('recordDelivery sends POST /reproductive-health/deliveries', async () => {
    const data = { patientName: 'Nguyen Thi A', deliveryDate: '2024-01-15', deliveryMethod: 'normal', birthWeight: 3200 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'del1' } })
    await reproductiveHealthApi.recordDelivery(data)
    expect(client.post).toHaveBeenCalledWith('/reproductive-health/deliveries', data)
  })

  it('getFamilyPlanning sends GET /reproductive-health/family-planning with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { method: 'IUD', pageIndex: 0, pageSize: 20 }
    await reproductiveHealthApi.getFamilyPlanning(params)
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/family-planning', { params })
  })

  it('createFamilyPlanning sends POST /reproductive-health/family-planning', async () => {
    const data = { patientId: 'p1', method: 'IUD', startDate: '2024-01-01' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'fp1' } })
    await reproductiveHealthApi.createFamilyPlanning(data)
    expect(client.post).toHaveBeenCalledWith('/reproductive-health/family-planning', data)
  })

  it('getAbortionRecords sends GET /reproductive-health/abortions', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    const params = { fromDate: '2024-01-01', toDate: '2024-12-31' }
    await reproductiveHealthApi.getAbortionRecords(params)
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/abortions', { params })
  })

  it('getGynecologyRecords sends GET /reproductive-health/gynecology', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    const params = { pageIndex: 0, pageSize: 20 }
    await reproductiveHealthApi.getGynecologyRecords(params)
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/gynecology', { params })
  })

  it('getStatistics sends GET /reproductive-health/statistics', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reproductiveHealthApi.getStatistics({ year: 2024 })
    expect(client.get).toHaveBeenCalledWith('/reproductive-health/statistics', { params: { year: 2024 } })
  })
})
