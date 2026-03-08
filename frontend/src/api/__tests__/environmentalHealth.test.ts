import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { environmentalHealthApi } from '../environmentalHealth'

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

describe('environmentalHealthApi', () => {
  it('getSanitationFacilities sends GET /environmental-health/sanitation with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', facilityType: 'toilet', meetsStandard: true, pageIndex: 0, pageSize: 20 }
    await environmentalHealthApi.getSanitationFacilities(params)
    expect(client.get).toHaveBeenCalledWith('/environmental-health/sanitation', { params })
  })

  it('getSanitationFacilities sends GET without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await environmentalHealthApi.getSanitationFacilities()
    expect(client.get).toHaveBeenCalledWith('/environmental-health/sanitation', { params: undefined })
  })

  it('createFacility sends POST /environmental-health/sanitation', async () => {
    const data = { householdId: 'h1', facilityType: 'toilet', condition: 'good', meetsStandard: true }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'f1' } })
    await environmentalHealthApi.createFacility(data)
    expect(client.post).toHaveBeenCalledWith('/environmental-health/sanitation', data)
  })

  it('updateFacility sends PUT /environmental-health/sanitation/:id', async () => {
    const data = { condition: 'fair', meetsStandard: false }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await environmentalHealthApi.updateFacility('f1', data)
    expect(client.put).toHaveBeenCalledWith('/environmental-health/sanitation/f1', data)
  })

  it('getWaterSources sends GET /environmental-health/water-sources with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'well', sourceType: 'groundwater', pageIndex: 0, pageSize: 20 }
    await environmentalHealthApi.getWaterSources(params)
    expect(client.get).toHaveBeenCalledWith('/environmental-health/water-sources', { params })
  })

  it('getWaterSources sends GET without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await environmentalHealthApi.getWaterSources()
    expect(client.get).toHaveBeenCalledWith('/environmental-health/water-sources', { params: undefined })
  })

  it('createWaterSource sends POST /environmental-health/water-sources', async () => {
    const data = { name: 'Well A', sourceType: 'groundwater', location: 'Village 1', servingHouseholds: 50 }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'ws1' } })
    await environmentalHealthApi.createWaterSource(data)
    expect(client.post).toHaveBeenCalledWith('/environmental-health/water-sources', data)
  })

  it('updateWaterSource sends PUT /environmental-health/water-sources/:id', async () => {
    const data = { qualityStatus: 'contaminated', meetsStandard: false }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await environmentalHealthApi.updateWaterSource('ws1', data)
    expect(client.put).toHaveBeenCalledWith('/environmental-health/water-sources/ws1', data)
  })

  it('getStatistics sends GET /environmental-health/statistics', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await environmentalHealthApi.getStatistics()
    expect(client.get).toHaveBeenCalledWith('/environmental-health/statistics')
  })
})
