import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { pharmacyApi } from '../pharmacy'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('pharmacyApi', () => {
  it('searchMedicines sends GET /pharmacy/stock', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'para', pageSize: 20 }
    await pharmacyApi.searchMedicines(params as any)
    expect(client.get).toHaveBeenCalledWith('/pharmacy/stock', { params })
  })

  it('getMedicineById sends GET /pharmacy/medicines/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: '1' } })
    await pharmacyApi.getMedicineById('1')
    expect(client.get).toHaveBeenCalledWith('/pharmacy/medicines/1')
  })

  it('getStockReceipts sends GET /pharmacy/receipts', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { fromDate: '2024-01-01', pageSize: 20 }
    await pharmacyApi.getStockReceipts(params)
    expect(client.get).toHaveBeenCalledWith('/pharmacy/receipts', { params })
  })

  it('createReceipt sends POST /pharmacy/receipts', async () => {
    const data = { type: 1, warehouseId: 'w1' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await pharmacyApi.createReceipt(data)
    expect(client.post).toHaveBeenCalledWith('/pharmacy/receipts', data)
  })

  it('approveReceipt sends POST /pharmacy/receipts/:id/approve', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await pharmacyApi.approveReceipt('1')
    expect(client.post).toHaveBeenCalledWith('/pharmacy/receipts/1/approve')
  })

  it('getPendingDispensing sends GET', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await pharmacyApi.getPendingDispensing()
    expect(client.get).toHaveBeenCalledWith('/pharmacy/dispensing/pending')
  })

  it('dispense sends POST /pharmacy/dispensing', async () => {
    const items = [{ medicineId: 'm1', quantity: 10, batchNumber: 'B1' }]
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await pharmacyApi.dispense('rx1', items as any)
    expect(client.post).toHaveBeenCalledWith('/pharmacy/dispensing', { prescriptionId: 'rx1', items })
  })

  it('transferToStation sends POST /pharmacy/transfer', async () => {
    const data = { toFacilityId: 'f1', items: [{ medicineId: 'm1', quantity: 5 }] }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await pharmacyApi.transferToStation(data)
    expect(client.post).toHaveBeenCalledWith('/pharmacy/transfer', data)
  })

  it('getUpperLevelStock sends GET', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await pharmacyApi.getUpperLevelStock()
    expect(client.get).toHaveBeenCalledWith('/pharmacy/upper-level/stock')
  })

  it('requestFromUpperLevel sends POST with items wrapper', async () => {
    const items = [{ medicineId: 'm1', quantity: 100 }]
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await pharmacyApi.requestFromUpperLevel(items)
    expect(client.post).toHaveBeenCalledWith('/pharmacy/upper-level/request', { items })
  })

  it('createRetailSale sends POST /pharmacy/retail-sales', async () => {
    const data = { warehouseId: 'w1', items: [] }
    vi.mocked(client.post).mockResolvedValue({ data: { id: '1' } })
    await pharmacyApi.createRetailSale(data as any)
    expect(client.post).toHaveBeenCalledWith('/pharmacy/retail-sales', data)
  })

  it('lockDocumentPeriod sends POST with null body and params', async () => {
    const params = { warehouseId: 'w1', year: 2024, month: 1 }
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await pharmacyApi.lockDocumentPeriod(params)
    expect(client.post).toHaveBeenCalledWith('/pharmacy/document-locks/lock', null, { params })
  })

  it('approvePrescription sends POST', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await pharmacyApi.approvePrescription('rx1')
    expect(client.post).toHaveBeenCalledWith('/pharmacy/prescriptions/rx1/approve')
  })

  it('getDocumentLocks sends GET with warehouseId', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await pharmacyApi.getDocumentLocks('w1')
    expect(client.get).toHaveBeenCalledWith('/pharmacy/document-locks', { params: { warehouseId: 'w1' } })
  })
})
