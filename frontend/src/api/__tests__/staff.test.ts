import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { staffApi } from '../staff'

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

describe('staffApi', () => {
  it('getList sends GET /staff with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', position: 'doctor', status: 1, pageIndex: 0, pageSize: 20 }
    await staffApi.getList(params)
    expect(client.get).toHaveBeenCalledWith('/staff', { params })
  })

  it('getList sends GET /staff without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await staffApi.getList()
    expect(client.get).toHaveBeenCalledWith('/staff', { params: undefined })
  })

  it('getById sends GET /staff/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 's1', fullName: 'Dr. Nguyen' } })
    const result = await staffApi.getById('s1')
    expect(client.get).toHaveBeenCalledWith('/staff/s1')
    expect(result.data.fullName).toBe('Dr. Nguyen')
  })

  it('create sends POST /staff', async () => {
    const data = { code: 'NV001', fullName: 'Nguyen Van A', position: 'doctor', gender: 1 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 's1' } })
    await staffApi.create(data)
    expect(client.post).toHaveBeenCalledWith('/staff', data)
  })

  it('update sends PUT /staff/:id', async () => {
    const data = { fullName: 'Updated Name', position: 'nurse' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await staffApi.update('s1', data)
    expect(client.put).toHaveBeenCalledWith('/staff/s1', data)
  })

  it('delete sends DELETE /staff/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue({ data: undefined })
    await staffApi.delete('s1')
    expect(client.delete).toHaveBeenCalledWith('/staff/s1')
  })

  it('mapPrescription sends PUT /staff/:id/prescription-mapping', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await staffApi.mapPrescription('s1', 'DT-001')
    expect(client.put).toHaveBeenCalledWith('/staff/s1/prescription-mapping', { mapping: 'DT-001' })
  })

  it('getDoctors sends GET /staff/doctors', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await staffApi.getDoctors()
    expect(client.get).toHaveBeenCalledWith('/staff/doctors')
  })
})
