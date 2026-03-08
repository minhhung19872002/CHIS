import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { inpatientApi } from '../inpatient'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('inpatientApi', () => {
  it('getAdmissions sends GET /inpatient/admissions', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { status: 0, pageSize: 20 }
    await inpatientApi.getAdmissions(params)
    expect(client.get).toHaveBeenCalledWith('/inpatient/admissions', { params })
  })

  it('getById sends GET /inpatient/admissions/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: '1' } })
    await inpatientApi.getById('1')
    expect(client.get).toHaveBeenCalledWith('/inpatient/admissions/1')
  })

  it('admit sends POST /inpatient/admissions', async () => {
    const data = { patientId: 'p1', departmentId: 'd1' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await inpatientApi.admit(data)
    expect(client.post).toHaveBeenCalledWith('/inpatient/admissions', data)
  })

  it('discharge sends POST /inpatient/admissions/:id/discharge', async () => {
    const data = { dischargeDiagnosis: 'Khoi', dischargeStatus: 1 }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await inpatientApi.discharge('1', data)
    expect(client.post).toHaveBeenCalledWith('/inpatient/admissions/1/discharge', data)
  })

  it('getVitalSigns sends GET /inpatient/:id/vitals', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await inpatientApi.getVitalSigns('adm1')
    expect(client.get).toHaveBeenCalledWith('/inpatient/adm1/vitals')
  })

  it('saveVitalSign sends POST /inpatient/:id/vitals', async () => {
    const data = { temperature: 37, pulse: 80 }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await inpatientApi.saveVitalSign('adm1', data as any)
    expect(client.post).toHaveBeenCalledWith('/inpatient/adm1/vitals', data)
  })

  it('getTreatmentSheets sends GET', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await inpatientApi.getTreatmentSheets('adm1')
    expect(client.get).toHaveBeenCalledWith('/inpatient/adm1/treatment-sheets')
  })

  it('saveTreatmentSheet sends POST', async () => {
    const data = { date: '2024-01-15', notes: 'Stable' }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await inpatientApi.saveTreatmentSheet('adm1', data as any)
    expect(client.post).toHaveBeenCalledWith('/inpatient/adm1/treatment-sheets', data)
  })

  it('getCareSheets sends GET', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await inpatientApi.getCareSheets('adm1')
    expect(client.get).toHaveBeenCalledWith('/inpatient/adm1/care-sheets')
  })

  it('saveCareSheet sends POST', async () => {
    const data = { date: '2024-01-15', nursingNotes: 'OK' }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await inpatientApi.saveCareSheet('adm1', data as any)
    expect(client.post).toHaveBeenCalledWith('/inpatient/adm1/care-sheets', data)
  })

  it('getPresenceList sends GET /inpatient/presence', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await inpatientApi.getPresenceList()
    expect(client.get).toHaveBeenCalledWith('/inpatient/presence')
  })

  it('getBedMap sends GET /inpatient/beds', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await inpatientApi.getBedMap()
    expect(client.get).toHaveBeenCalledWith('/inpatient/beds')
  })
})
