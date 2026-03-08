import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { chronicDiseaseApi } from '../chronicDisease'

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

describe('chronicDiseaseApi', () => {
  it('search sends GET /chronic-disease with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], totalCount: 0 } })
    const params = { keyword: 'test', diseaseType: 'diabetes', pageIndex: 0, pageSize: 20 }
    await chronicDiseaseApi.search(params)
    expect(client.get).toHaveBeenCalledWith('/chronic-disease', { params })
  })

  it('getById sends GET /chronic-disease/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'c1' } })
    await chronicDiseaseApi.getById('c1')
    expect(client.get).toHaveBeenCalledWith('/chronic-disease/c1')
  })

  it('register sends POST /chronic-disease', async () => {
    const data = { patientId: 'p1', diseaseType: 'hypertension', notes: 'Stage 1' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'c1' } })
    await chronicDiseaseApi.register(data)
    expect(client.post).toHaveBeenCalledWith('/chronic-disease', data)
  })

  it('updateStatus sends PUT /chronic-disease/:id/status with status param', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await chronicDiseaseApi.updateStatus('c1', 'inactive')
    expect(client.put).toHaveBeenCalledWith('/chronic-disease/c1/status', null, { params: { status: 'inactive' } })
  })

  it('getTreatments sends GET /chronic-disease/:id/treatments', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await chronicDiseaseApi.getTreatments('c1')
    expect(client.get).toHaveBeenCalledWith('/chronic-disease/c1/treatments')
  })

  it('addTreatment sends POST /chronic-disease/treatments', async () => {
    const data = { registerId: 'c1', progress: 'stable', notes: 'continue meds' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 't1' } })
    await chronicDiseaseApi.addTreatment(data)
    expect(client.post).toHaveBeenCalledWith('/chronic-disease/treatments', data)
  })

  it('createNcdExamination sends POST /chronic-disease/examinations', async () => {
    const data = { registerId: 'c1', systolicBP: 140, diastolicBP: 90 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'e1' } })
    await chronicDiseaseApi.createNcdExamination(data)
    expect(client.post).toHaveBeenCalledWith('/chronic-disease/examinations', data)
  })

  it('getNcdExaminations sends GET /chronic-disease/:id/examinations', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await chronicDiseaseApi.getNcdExaminations('c1')
    expect(client.get).toHaveBeenCalledWith('/chronic-disease/c1/examinations')
  })

  it('createReferral sends POST /chronic-disease/referrals', async () => {
    const data = { registerId: 'c1', toFacility: 'BV Huyen', reason: 'Complication' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'ref1' } })
    await chronicDiseaseApi.createReferral(data)
    expect(client.post).toHaveBeenCalledWith('/chronic-disease/referrals', data)
  })

  it('createSickLeave sends POST /chronic-disease/sick-leaves', async () => {
    const data = { registerId: 'c1', fromDate: '2024-01-01', toDate: '2024-01-05' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'sl1' } })
    await chronicDiseaseApi.createSickLeave(data)
    expect(client.post).toHaveBeenCalledWith('/chronic-disease/sick-leaves', data)
  })

  it('getTrackingBook sends GET /chronic-disease/tracking-books/:bookType', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await chronicDiseaseApi.getTrackingBook('hypertension', 'f1')
    expect(client.get).toHaveBeenCalledWith('/chronic-disease/tracking-books/hypertension', { params: { facilityId: 'f1' } })
  })

  it('getBPChartData sends GET /chronic-disease/:id/bp-chart', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await chronicDiseaseApi.getBPChartData('c1')
    expect(client.get).toHaveBeenCalledWith('/chronic-disease/c1/bp-chart')
  })

  it('getGlucoseChartData sends GET /chronic-disease/:id/glucose-chart', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await chronicDiseaseApi.getGlucoseChartData('c1')
    expect(client.get).toHaveBeenCalledWith('/chronic-disease/c1/glucose-chart')
  })
})
