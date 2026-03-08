import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { driverLicenseExamApi } from '../driverLicenseExam'

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

describe('driverLicenseExamApi', () => {
  it('search sends GET /driver-license-exam with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', fromDate: '2024-01-01', toDate: '2024-01-31', licenseClass: 'B1', pageIndex: 0, pageSize: 20 }
    await driverLicenseExamApi.search(params)
    expect(client.get).toHaveBeenCalledWith('/driver-license-exam', { params })
  })

  it('getById sends GET /driver-license-exam/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'd1', patientName: 'Nguyen Van A' } })
    const result = await driverLicenseExamApi.getById('d1')
    expect(client.get).toHaveBeenCalledWith('/driver-license-exam/d1')
    expect(result.data.patientName).toBe('Nguyen Van A')
  })

  it('create sends POST /driver-license-exam', async () => {
    const data = { patientName: 'Nguyen Van A', licenseClass: 'B1', idNumber: '012345678901' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'd1' } })
    await driverLicenseExamApi.create(data)
    expect(client.post).toHaveBeenCalledWith('/driver-license-exam', data)
  })

  it('update sends PUT /driver-license-exam/:id', async () => {
    const data = { overallResult: 1, note: 'Pass' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await driverLicenseExamApi.update('d1', data)
    expect(client.put).toHaveBeenCalledWith('/driver-license-exam/d1', data)
  })

  it('approve sends POST /driver-license-exam/:id/approve', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await driverLicenseExamApi.approve('d1')
    expect(client.post).toHaveBeenCalledWith('/driver-license-exam/d1/approve')
  })

  it('print sends GET /driver-license-exam/:id/print', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await driverLicenseExamApi.print('d1')
    expect(client.get).toHaveBeenCalledWith('/driver-license-exam/d1/print')
  })

  it('getStatistics sends GET /driver-license-exam/statistics with params', async () => {
    const params = { month: 1, year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await driverLicenseExamApi.getStatistics(params)
    expect(client.get).toHaveBeenCalledWith('/driver-license-exam/statistics', { params })
  })
})
