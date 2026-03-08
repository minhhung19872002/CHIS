import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { hivAidsApi } from '../hivAids'

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

describe('hivAidsApi', () => {
  it('getPatients sends GET /hiv-aids/patients with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', status: 1, pageIndex: 0, pageSize: 20 }
    await hivAidsApi.getPatients(params)
    expect(client.get).toHaveBeenCalledWith('/hiv-aids/patients', { params })
  })

  it('getById sends GET /hiv-aids/patients/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'h1', patientName: 'Test' } })
    const result = await hivAidsApi.getById('h1')
    expect(client.get).toHaveBeenCalledWith('/hiv-aids/patients/h1')
    expect(result.data.patientName).toBe('Test')
  })

  it('register sends POST /hiv-aids/patients', async () => {
    const data = { patientId: 'p1', diagnosisDate: '2024-01-01', clinicalStage: 1 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'h1' } })
    await hivAidsApi.register(data)
    expect(client.post).toHaveBeenCalledWith('/hiv-aids/patients', data)
  })

  it('update sends PUT /hiv-aids/patients/:id', async () => {
    const data = { clinicalStage: 2, cd4Count: 350 }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await hivAidsApi.update('h1', data)
    expect(client.put).toHaveBeenCalledWith('/hiv-aids/patients/h1', data)
  })

  it('addFamilyMember sends POST /hiv-aids/patients/:id/family', async () => {
    const data = { fullName: 'Family Member', relationship: 'spouse', hivStatus: 'negative' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'fm1' } })
    await hivAidsApi.addFamilyMember('h1', data)
    expect(client.post).toHaveBeenCalledWith('/hiv-aids/patients/h1/family', data)
  })

  it('getArvHistory sends GET /hiv-aids/patients/:id/arv-history', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await hivAidsApi.getArvHistory('h1')
    expect(client.get).toHaveBeenCalledWith('/hiv-aids/patients/h1/arv-history')
  })

  it('recordArvDispensing sends POST /hiv-aids/arv-dispensing', async () => {
    const data = { patientId: 'p1', regimen: 'TDF/3TC/DTG', dispensedDays: 30, dispensedDate: '2024-01-15' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'arv1' } })
    await hivAidsApi.recordArvDispensing(data)
    expect(client.post).toHaveBeenCalledWith('/hiv-aids/arv-dispensing', data)
  })

  it('getStatistics sends GET /hiv-aids/statistics with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await hivAidsApi.getStatistics({ year: 2024 })
    expect(client.get).toHaveBeenCalledWith('/hiv-aids/statistics', { params: { year: 2024 } })
  })

  it('getReport sends GET /hiv-aids/reports with params', async () => {
    const params = { quarter: 1, year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await hivAidsApi.getReport(params)
    expect(client.get).toHaveBeenCalledWith('/hiv-aids/reports', { params })
  })
})
