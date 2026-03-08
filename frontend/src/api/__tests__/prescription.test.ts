import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { prescriptionApi } from '../prescription'

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

describe('prescriptionApi', () => {
  it('getByExamination sends GET', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: '1' } })
    await prescriptionApi.getByExamination('exam1')
    expect(client.get).toHaveBeenCalledWith('/prescriptions/examination/exam1')
  })

  it('create sends POST /prescriptions', async () => {
    const data = { examinationId: 'exam1', items: [] }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await prescriptionApi.create(data)
    expect(client.post).toHaveBeenCalledWith('/prescriptions', data)
  })

  it('update sends PUT /prescriptions/:id', async () => {
    const data = { diagnosis: 'updated' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await prescriptionApi.update('1', data)
    expect(client.put).toHaveBeenCalledWith('/prescriptions/1', data)
  })

  it('delete sends DELETE /prescriptions/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue({ data: undefined })
    await prescriptionApi.delete('1')
    expect(client.delete).toHaveBeenCalledWith('/prescriptions/1')
  })

  it('getTemplates sends GET /prescriptions/templates', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await prescriptionApi.getTemplates()
    expect(client.get).toHaveBeenCalledWith('/prescriptions/templates')
  })

  it('checkInteractions sends POST with medicineIds', async () => {
    const ids = ['m1', 'm2', 'm3']
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await prescriptionApi.checkInteractions(ids)
    expect(client.post).toHaveBeenCalledWith('/prescriptions/check-interactions', { medicineIds: ids })
  })
})
