import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { examinationApi } from '../examination'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('examinationApi', () => {
  it('search sends GET /examination with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', pageIndex: 1, pageSize: 20 }
    await examinationApi.search(params as any)
    expect(client.get).toHaveBeenCalledWith('/examination', { params })
  })

  it('getById sends GET /examination/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: '1' } })
    await examinationApi.getById('1')
    expect(client.get).toHaveBeenCalledWith('/examination/1')
  })

  it('create sends POST /examination', async () => {
    const data = { patientId: 'p1' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await examinationApi.create(data)
    expect(client.post).toHaveBeenCalledWith('/examination', data)
  })

  it('update sends PUT /examination/:id', async () => {
    const data = { chiefComplaint: 'headache' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await examinationApi.update('1', data)
    expect(client.put).toHaveBeenCalledWith('/examination/1', data)
  })

  it('saveVitalSigns sends PUT', async () => {
    const data = { temperature: 37, bloodPressureSystolic: 120 }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await examinationApi.saveVitalSigns('1', data as any)
    expect(client.put).toHaveBeenCalledWith('/examination/1/vital-signs', data)
  })

  it('saveDiagnosis sends PUT', async () => {
    const data = { mainCode: 'J06', mainName: 'URTI' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await examinationApi.saveDiagnosis('1', data)
    expect(client.put).toHaveBeenCalledWith('/examination/1/diagnosis', data)
  })

  it('complete sends POST', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await examinationApi.complete('1')
    expect(client.post).toHaveBeenCalledWith('/examination/1/complete')
  })

  it('getQueueList sends GET with roomId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await examinationApi.getQueueList('room1')
    expect(client.get).toHaveBeenCalledWith('/examination/queue', { params: { roomId: 'room1' } })
  })

  it('getSpecializedRecords sends GET with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await examinationApi.getSpecializedRecords('p1', 'prenatal')
    expect(client.get).toHaveBeenCalledWith('/examination/specialized-records', { params: { patientId: 'p1', recordType: 'prenatal' } })
  })

  it('createSpecializedRecord sends POST', async () => {
    const data = { patientId: 'p1', recordType: 'prenatal' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await examinationApi.createSpecializedRecord(data as any)
    expect(client.post).toHaveBeenCalledWith('/examination/specialized-records', data)
  })

  it('deleteSpecializedRecord sends DELETE', async () => {
    vi.mocked(client.delete).mockResolvedValue({ data: undefined })
    await examinationApi.deleteSpecializedRecord('1')
    expect(client.delete).toHaveBeenCalledWith('/examination/specialized-records/1')
  })

  it('getTrackingBookEntries sends GET', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await examinationApi.getTrackingBookEntries('p1', 'diabetes')
    expect(client.get).toHaveBeenCalledWith('/examination/tracking-books', { params: { patientId: 'p1', bookType: 'diabetes' } })
  })

  it('createTrackingBookEntry sends POST', async () => {
    const data = { patientId: 'p1', bookType: 'diabetes' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await examinationApi.createTrackingBookEntry(data as any)
    expect(client.post).toHaveBeenCalledWith('/examination/tracking-books', data)
  })

  it('deleteTrackingBookEntry sends DELETE', async () => {
    vi.mocked(client.delete).mockResolvedValue({ data: undefined })
    await examinationApi.deleteTrackingBookEntry('1')
    expect(client.delete).toHaveBeenCalledWith('/examination/tracking-books/1')
  })

  it('changePatientType sends PUT', async () => {
    const data = { newType: 'inpatient', reason: 'needs observation' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await examinationApi.changePatientType('1', data)
    expect(client.put).toHaveBeenCalledWith('/examination/1/change-type', data)
  })
})
