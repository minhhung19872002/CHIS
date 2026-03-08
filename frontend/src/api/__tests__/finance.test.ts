import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { financeApi } from '../finance'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('financeApi', () => {
  it('getVouchers sends GET /finance/vouchers with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { voucherType: 'income', fromDate: '2024-01-01', toDate: '2024-01-31', pageIndex: 0, pageSize: 20 }
    await financeApi.getVouchers(params)
    expect(client.get).toHaveBeenCalledWith('/finance/vouchers', { params })
  })

  it('getVouchers sends GET /finance/vouchers without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await financeApi.getVouchers()
    expect(client.get).toHaveBeenCalledWith('/finance/vouchers', { params: undefined })
  })

  it('getVoucherById sends GET /finance/vouchers/:id', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { id: 'v1', voucherNumber: 'PT001' } })
    const result = await financeApi.getVoucherById('v1')
    expect(client.get).toHaveBeenCalledWith('/finance/vouchers/v1')
    expect(result.data.voucherNumber).toBe('PT001')
  })

  it('createVoucher sends POST /finance/vouchers', async () => {
    const data = { voucherType: 'income', amount: 500000, description: 'Thu vien phi' }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'v1' } })
    await financeApi.createVoucher(data)
    expect(client.post).toHaveBeenCalledWith('/finance/vouchers', data)
  })

  it('approveVoucher sends POST /finance/vouchers/:id/approve', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await financeApi.approveVoucher('v1')
    expect(client.post).toHaveBeenCalledWith('/finance/vouchers/v1/approve')
  })

  it('cancelVoucher sends POST /finance/vouchers/:id/cancel with reason', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await financeApi.cancelVoucher('v1', 'Nhap sai')
    expect(client.post).toHaveBeenCalledWith('/finance/vouchers/v1/cancel', { reason: 'Nhap sai' })
  })

  it('getBalanceReport sends GET /finance/balance-report with params', async () => {
    const params = { fromDate: '2024-01-01', toDate: '2024-01-31' }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await financeApi.getBalanceReport(params)
    expect(client.get).toHaveBeenCalledWith('/finance/balance-report', { params })
  })

  it('getCashBook sends GET /finance/cash-book with params', async () => {
    const params = { month: 1, year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await financeApi.getCashBook(params)
    expect(client.get).toHaveBeenCalledWith('/finance/cash-book', { params })
  })

  it('getIncomeExpenseReport sends GET /finance/income-expense-report', async () => {
    const params = { year: 2024 }
    vi.mocked(client.get).mockResolvedValue({ data: {} })
    await financeApi.getIncomeExpenseReport(params)
    expect(client.get).toHaveBeenCalledWith('/finance/income-expense-report', { params })
  })
})
