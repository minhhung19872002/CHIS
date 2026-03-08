import { describe, it, expect, vi, beforeEach } from 'vitest'
import { patientApi } from '../patient'
import client from '../client'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('patientApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('search', () => {
    it('should call GET /patients with search params', async () => {
      const mockResponse = {
        data: { items: [{ id: '1', fullName: 'Test' }], total: 1 },
      }
      vi.mocked(client.get).mockResolvedValue(mockResponse)

      const result = await patientApi.search({ keyword: 'Nguyen', pageIndex: 0, pageSize: 20 })

      expect(client.get).toHaveBeenCalledWith('/patients', {
        params: { keyword: 'Nguyen', pageIndex: 0, pageSize: 20 },
      })
      expect(result.data.items).toHaveLength(1)
    })

    it('should handle empty results', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })

      const result = await patientApi.search({})

      expect(result.data.items).toHaveLength(0)
    })
  })

  describe('getById', () => {
    it('should call GET /patients/:id', async () => {
      const mockPatient = { id: 'p1', fullName: 'Nguyen Van A', code: 'BN001' }
      vi.mocked(client.get).mockResolvedValue({ data: mockPatient })

      const result = await patientApi.getById('p1')

      expect(client.get).toHaveBeenCalledWith('/patients/p1')
      expect(result.data.fullName).toBe('Nguyen Van A')
    })

    it('should propagate 404 error', async () => {
      vi.mocked(client.get).mockRejectedValue({ response: { status: 404 } })

      await expect(patientApi.getById('nonexistent')).rejects.toBeDefined()
    })
  })

  describe('create', () => {
    it('should call POST /patients with data', async () => {
      const newPatient = { fullName: 'Tran Van B', gender: 1 }
      vi.mocked(client.post).mockResolvedValue({
        data: { id: 'p2', code: 'BN002', ...newPatient },
      })

      const result = await patientApi.create(newPatient)

      expect(client.post).toHaveBeenCalledWith('/patients', newPatient)
      expect(result.data.code).toBe('BN002')
    })
  })

  describe('update', () => {
    it('should call PUT /patients/:id with data', async () => {
      const updateData = { fullName: 'Updated Name' }
      vi.mocked(client.put).mockResolvedValue({ data: { id: 'p1', ...updateData } })

      await patientApi.update('p1', updateData)

      expect(client.put).toHaveBeenCalledWith('/patients/p1', updateData)
    })
  })

  describe('getHistory', () => {
    it('should call GET /patients/:id/history', async () => {
      vi.mocked(client.get).mockResolvedValue({ data: [] })

      await patientApi.getHistory('p1')

      expect(client.get).toHaveBeenCalledWith('/patients/p1/history')
    })
  })

  describe('getMedicalRecords', () => {
    it('should call GET /patients/:id/medical-records', async () => {
      vi.mocked(client.get).mockResolvedValue({
        data: [{ id: 'r1', recordNumber: 'BA001' }],
      })

      const result = await patientApi.getMedicalRecords('p1')

      expect(client.get).toHaveBeenCalledWith('/patients/p1/medical-records')
      expect(result.data).toHaveLength(1)
    })
  })
})
