import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { foodSafetyApi } from '../foodSafety'

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

describe('foodSafetyApi', () => {
  it('getBusinesses sends GET /food-safety/businesses with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', businessType: 'restaurant', pageIndex: 0, pageSize: 20 }
    await foodSafetyApi.getBusinesses(params)
    expect(client.get).toHaveBeenCalledWith('/food-safety/businesses', { params })
  })

  it('getBusinesses sends GET /food-safety/businesses without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await foodSafetyApi.getBusinesses()
    expect(client.get).toHaveBeenCalledWith('/food-safety/businesses', { params: undefined })
  })

  it('createBusiness sends POST /food-safety/businesses', async () => {
    const data = { name: 'Quan An A', address: '123 Street', ownerName: 'Nguyen Van A', businessType: 'restaurant' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'b1' } })
    await foodSafetyApi.createBusiness(data)
    expect(client.post).toHaveBeenCalledWith('/food-safety/businesses', data)
  })

  it('updateBusiness sends PUT /food-safety/businesses/:id', async () => {
    const data = { name: 'Updated Name' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await foodSafetyApi.updateBusiness('b1', data)
    expect(client.put).toHaveBeenCalledWith('/food-safety/businesses/b1', data)
  })

  it('recordViolation sends POST /food-safety/violations', async () => {
    const data = { businessId: 'b1', violationDate: '2024-01-15', description: 'Dirty kitchen', severity: 'high' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'v1' } })
    await foodSafetyApi.recordViolation(data)
    expect(client.post).toHaveBeenCalledWith('/food-safety/violations', data)
  })

  it('getPoisoningIncidents sends GET /food-safety/poisoning with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { year: 2024, pageIndex: 0, pageSize: 20 }
    await foodSafetyApi.getPoisoningIncidents(params)
    expect(client.get).toHaveBeenCalledWith('/food-safety/poisoning', { params })
  })

  it('reportPoisoning sends POST /food-safety/poisoning', async () => {
    const data = { incidentDate: '2024-01-15', location: 'School', affectedCount: 20, suspectedFood: 'Banh mi' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'p1' } })
    await foodSafetyApi.reportPoisoning(data)
    expect(client.post).toHaveBeenCalledWith('/food-safety/poisoning', data)
  })

  it('getStatistics sends GET /food-safety/statistics', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await foodSafetyApi.getStatistics({ year: 2024 })
    expect(client.get).toHaveBeenCalledWith('/food-safety/statistics', { params: { year: 2024 } })
  })
})
