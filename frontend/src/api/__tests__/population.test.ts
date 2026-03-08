import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { populationApi } from '../population'

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

describe('populationApi', () => {
  it('searchHouseholds sends GET /population/households with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'Nguyen', wardId: 'w1', pageIndex: 0, pageSize: 20 }
    await populationApi.searchHouseholds(params)
    expect(client.get).toHaveBeenCalledWith('/population/households', { params })
  })

  it('getHousehold sends GET /population/households/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'h1', householdCode: 'HH001' } })
    const result = await populationApi.getHousehold('h1')
    expect(client.get).toHaveBeenCalledWith('/population/households/h1')
    expect(result.data.householdCode).toBe('HH001')
  })

  it('createHousehold sends POST /population/households', async () => {
    const data = { headName: 'Nguyen Van A', address: '123 Main St', wardId: 'w1' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'h1' } })
    await populationApi.createHousehold(data)
    expect(client.post).toHaveBeenCalledWith('/population/households', data)
  })

  it('updateHousehold sends PUT /population/households/:id', async () => {
    const data = { headName: 'Updated Name' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await populationApi.updateHousehold('h1', data)
    expect(client.put).toHaveBeenCalledWith('/population/households/h1', data)
  })

  it('addMember sends POST /population/households/:id/members', async () => {
    const data = { fullName: 'Nguyen Van B', relationship: 'con', dateOfBirth: '2000-01-01', gender: 1 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'm1' } })
    await populationApi.addMember('h1', data)
    expect(client.post).toHaveBeenCalledWith('/population/households/h1/members', data)
  })

  it('getBirthCertificates sends GET /population/births with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { year: 2024, pageIndex: 0, pageSize: 20 }
    await populationApi.getBirthCertificates(params)
    expect(client.get).toHaveBeenCalledWith('/population/births', { params })
  })

  it('getBirthCertificates sends GET /population/births without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await populationApi.getBirthCertificates()
    expect(client.get).toHaveBeenCalledWith('/population/births', { params: undefined })
  })

  it('createBirth sends POST /population/births', async () => {
    const data = { childName: 'Baby A', dateOfBirth: '2024-01-15', gender: 1, birthPlace: 'TYT', motherName: 'Nguyen Thi C' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'b1' } })
    await populationApi.createBirth(data)
    expect(client.post).toHaveBeenCalledWith('/population/births', data)
  })

  it('getDeathCertificates sends GET /population/deaths with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { year: 2024, pageIndex: 0, pageSize: 20 }
    await populationApi.getDeathCertificates(params)
    expect(client.get).toHaveBeenCalledWith('/population/deaths', { params })
  })

  it('createDeath sends POST /population/deaths', async () => {
    const data = { deceasedName: 'Tran Van D', dateOfDeath: '2024-01-10', causeOfDeath: 'Natural' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'd1' } })
    await populationApi.createDeath(data)
    expect(client.post).toHaveBeenCalledWith('/population/deaths', data)
  })

  it('getElderlyList sends GET /population/elderly', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { ageFrom: 60, pageIndex: 0, pageSize: 20 }
    await populationApi.getElderlyList(params)
    expect(client.get).toHaveBeenCalledWith('/population/elderly', { params })
  })

  it('getDemographicStats sends GET /population/statistics', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await populationApi.getDemographicStats()
    expect(client.get).toHaveBeenCalledWith('/population/statistics')
  })
})
