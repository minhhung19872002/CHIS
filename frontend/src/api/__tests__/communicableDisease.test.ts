import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { communicableDiseaseApi } from '../communicableDisease'

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

describe('communicableDiseaseApi', () => {
  it('getCases sends GET /communicable-disease/cases with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', diseaseCode: 'A09', fromDate: '2024-01-01', toDate: '2024-01-31', pageIndex: 0, pageSize: 20 }
    await communicableDiseaseApi.getCases(params)
    expect(client.get).toHaveBeenCalledWith('/communicable-disease/cases', { params })
  })

  it('getCaseById sends GET /communicable-disease/cases/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'c1' } })
    await communicableDiseaseApi.getCaseById('c1')
    expect(client.get).toHaveBeenCalledWith('/communicable-disease/cases/c1')
  })

  it('reportCase sends POST /communicable-disease/cases', async () => {
    const data = { patientName: 'Nguyen Van A', diseaseCode: 'A09', onsetDate: '2024-01-15' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'c1' } })
    await communicableDiseaseApi.reportCase(data)
    expect(client.post).toHaveBeenCalledWith('/communicable-disease/cases', data)
  })

  it('updateCase sends PUT /communicable-disease/cases/:id', async () => {
    const data = { outcome: 'recovered', status: 2 }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await communicableDiseaseApi.updateCase('c1', data)
    expect(client.put).toHaveBeenCalledWith('/communicable-disease/cases/c1', data)
  })

  it('getWeeklyReports sends GET /communicable-disease/weekly-reports', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    const params = { year: 2024 }
    await communicableDiseaseApi.getWeeklyReports(params)
    expect(client.get).toHaveBeenCalledWith('/communicable-disease/weekly-reports', { params })
  })

  it('getWeeklyReports sends GET without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await communicableDiseaseApi.getWeeklyReports()
    expect(client.get).toHaveBeenCalledWith('/communicable-disease/weekly-reports', { params: undefined })
  })

  it('submitWeeklyReport sends POST /communicable-disease/weekly-reports', async () => {
    const data = { weekNumber: 3, year: 2024 }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await communicableDiseaseApi.submitWeeklyReport(data)
    expect(client.post).toHaveBeenCalledWith('/communicable-disease/weekly-reports', data)
  })

  it('getMonthlyReport sends GET /communicable-disease/monthly-report', async () => {
    const params = { month: 1, year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await communicableDiseaseApi.getMonthlyReport(params)
    expect(client.get).toHaveBeenCalledWith('/communicable-disease/monthly-report', { params })
  })

  it('getDiseaseSurveillance sends GET /communicable-disease/surveillance', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await communicableDiseaseApi.getDiseaseSurveillance()
    expect(client.get).toHaveBeenCalledWith('/communicable-disease/surveillance')
  })
})
