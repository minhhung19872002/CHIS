import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { reportApi } from '../report'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('reportApi', () => {
  it('getDashboard sends GET /report/dashboard with facilityId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getDashboard('f1')
    expect(client.get).toHaveBeenCalledWith('/report/dashboard', { params: { facilityId: 'f1' } })
  })

  it('getDashboard sends GET /report/dashboard without facilityId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getDashboard()
    expect(client.get).toHaveBeenCalledWith('/report/dashboard', { params: { facilityId: undefined } })
  })

  it('getMonthlyStatistics sends GET /report/monthly with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getMonthlyStatistics(2024, 1, 'f1')
    expect(client.get).toHaveBeenCalledWith('/report/monthly', { params: { year: 2024, month: 1, facilityId: 'f1' } })
  })

  it('getDiseaseStatistics sends GET /report/diseases with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getDiseaseStatistics('2024-01-01', '2024-01-31', 'f1')
    expect(client.get).toHaveBeenCalledWith('/report/diseases', { params: { fromDate: '2024-01-01', toDate: '2024-01-31', facilityId: 'f1' } })
  })

  it('getImmunizationCoverage sends GET /report/immunization-coverage', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getImmunizationCoverage(2024, 'f1')
    expect(client.get).toHaveBeenCalledWith('/report/immunization-coverage', { params: { year: 2024, facilityId: 'f1' } })
  })

  it('getBcxReport sends GET /report/bcx/:number with filter', async () => {
    const filter = { year: 2024, month: 1 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getBcxReport(1, filter)
    expect(client.get).toHaveBeenCalledWith('/report/bcx/1', { params: filter })
  })

  it('getBchReport sends GET /report/bch/:number with filter', async () => {
    const filter = { year: 2024, quarter: 1 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getBchReport(3, filter)
    expect(client.get).toHaveBeenCalledWith('/report/bch/3', { params: filter })
  })

  it('getBcxTT37Report sends GET /report/bcx-tt37/:number', async () => {
    const filter = { year: 2024, month: 6 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getBcxTT37Report(2, filter)
    expect(client.get).toHaveBeenCalledWith('/report/bcx-tt37/2', { params: filter })
  })

  it('getBchTT37Report sends GET /report/bch-tt37/:number', async () => {
    const filter = { year: 2024, quarter: 2 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getBchTT37Report(5, filter)
    expect(client.get).toHaveBeenCalledWith('/report/bch-tt37/5', { params: filter })
  })

  it('exportReport sends POST /report/export with responseType blob', async () => {
    const params = { format: 'excel' as const, reportType: 'monthly', filter: { year: 2024, month: 1 } }
    vi.mocked(client.post).mockResolvedValue({ data: new Blob() })
    await reportApi.exportReport(params)
    expect(client.post).toHaveBeenCalledWith('/report/export', params, { responseType: 'blob' })
  })

  it('getBhytReport sends GET /report/bhyt/:mau', async () => {
    const filter = { year: 2024, month: 1 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getBhytReport('20', filter)
    expect(client.get).toHaveBeenCalledWith('/report/bhyt/20', { params: filter })
  })

  it('getSoYtcs sends GET /report/so-ytcs/:soType', async () => {
    const filter = { year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getSoYtcs('A1', filter)
    expect(client.get).toHaveBeenCalledWith('/report/so-ytcs/A1', { params: filter })
  })

  it('getBhytSummary sends GET /report/bhyt-summary', async () => {
    const filter = { year: 2024, quarter: 1 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getBhytSummary(filter)
    expect(client.get).toHaveBeenCalledWith('/report/bhyt-summary', { params: filter })
  })

  it('getNcdStatistics sends GET /report/ncd-statistics', async () => {
    const filter = { year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await reportApi.getNcdStatistics(filter)
    expect(client.get).toHaveBeenCalledWith('/report/ncd-statistics', { params: filter })
  })
})
