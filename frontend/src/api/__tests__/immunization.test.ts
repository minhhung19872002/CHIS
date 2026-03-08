import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { immunizationApi } from '../immunization'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('immunizationApi', () => {
  it('getSubjects sends GET /immunization/subjects with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], totalCount: 0 } })
    const params = { keyword: 'test', village: 'v1', pageIndex: 0, pageSize: 20 }
    await immunizationApi.getSubjects(params)
    expect(client.get).toHaveBeenCalledWith('/immunization/subjects', { params })
  })

  it('getSubjectById sends GET /immunization/subjects/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 's1' } })
    await immunizationApi.getSubjectById('s1')
    expect(client.get).toHaveBeenCalledWith('/immunization/subjects/s1')
  })

  it('createSubject sends POST /immunization/subjects', async () => {
    const data = { fullName: 'Baby A', dateOfBirth: '2024-01-01', gender: 1, motherName: 'Mother A' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 's1' } })
    await immunizationApi.createSubject(data)
    expect(client.post).toHaveBeenCalledWith('/immunization/subjects', data)
  })

  it('getVaccinations sends GET /immunization/subjects/:id/vaccinations', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await immunizationApi.getVaccinations('s1')
    expect(client.get).toHaveBeenCalledWith('/immunization/subjects/s1/vaccinations')
  })

  it('recordVaccination sends POST /immunization/vaccinations', async () => {
    const data = { subjectId: 's1', vaccineId: 'v1', doseNumber: 1 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'vac1' } })
    await immunizationApi.recordVaccination(data)
    expect(client.post).toHaveBeenCalledWith('/immunization/vaccinations', data)
  })

  it('getVaccines sends GET /immunization/vaccines', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await immunizationApi.getVaccines()
    expect(client.get).toHaveBeenCalledWith('/immunization/vaccines')
  })

  it('createVaccine sends POST /immunization/vaccines', async () => {
    const data = { id: 'v1', code: 'BCG', name: 'BCG', isActive: true } as any
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'v1' } })
    await immunizationApi.createVaccine(data)
    expect(client.post).toHaveBeenCalledWith('/immunization/vaccines', data)
  })

  it('getVaccineStock sends GET /immunization/vaccine-stock with vaccineId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await immunizationApi.getVaccineStock('v1')
    expect(client.get).toHaveBeenCalledWith('/immunization/vaccine-stock', { params: { vaccineId: 'v1' } })
  })

  it('getVaccineStock sends GET /immunization/vaccine-stock without vaccineId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await immunizationApi.getVaccineStock()
    expect(client.get).toHaveBeenCalledWith('/immunization/vaccine-stock', { params: { vaccineId: undefined } })
  })

  it('getNutritionMeasurements sends GET /immunization/subjects/:id/nutrition', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await immunizationApi.getNutritionMeasurements('s1')
    expect(client.get).toHaveBeenCalledWith('/immunization/subjects/s1/nutrition')
  })

  it('recordMeasurement sends POST /immunization/subjects/:id/nutrition', async () => {
    const data = { measurementDate: '2024-01-01', weight: 8.5, height: 70 } as any
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await immunizationApi.recordMeasurement('s1', data)
    expect(client.post).toHaveBeenCalledWith('/immunization/subjects/s1/nutrition', data)
  })

  it('createVaccineStockIssue sends POST /immunization/vaccine-stock-issues', async () => {
    const data = { issueType: 'receipt', vaccineId: 'v1', quantity: 100 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'si1' } })
    await immunizationApi.createVaccineStockIssue(data)
    expect(client.post).toHaveBeenCalledWith('/immunization/vaccine-stock-issues', data)
  })

  it('getVaccineStockIssues sends GET /immunization/vaccine-stock-issues', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], totalCount: 0 } })
    const params = { issueType: 'receipt', pageIndex: 0, pageSize: 20 }
    await immunizationApi.getVaccineStockIssues(params)
    expect(client.get).toHaveBeenCalledWith('/immunization/vaccine-stock-issues', { params })
  })

  it('getReport sends GET /immunization/reports/:reportCode with params', async () => {
    const params = { year: 2024, month: 1 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await immunizationApi.getReport('BCX1', params)
    expect(client.get).toHaveBeenCalledWith('/immunization/reports/BCX1', { params })
  })

  it('sendReport sends POST /immunization/reports/:reportCode/:reportId/send', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await immunizationApi.sendReport('BCX1', 'rpt1')
    expect(client.post).toHaveBeenCalledWith('/immunization/reports/BCX1/rpt1/send')
  })

  it('getChildStats sends GET /immunization/child-stats', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await immunizationApi.getChildStats('f1')
    expect(client.get).toHaveBeenCalledWith('/immunization/child-stats', { params: { facilityId: 'f1' } })
  })
})
