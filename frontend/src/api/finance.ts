import client from './client';

export interface VoucherDto {
  id: string;
  voucherNumber: string;
  voucherType: 'income' | 'expense';
  date: string;
  amount: number;
  description: string;
  category: string;
  payerOrReceiver: string;
  paymentMethod: string;
  referenceNumber?: string;
  createdBy: string;
  approvedBy?: string;
  status: number;
}

export interface BalanceReportDto {
  period: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  items: { category: string; income: number; expense: number }[];
}

export const financeApi = {
  getVouchers: (params?: { voucherType?: string; fromDate?: string; toDate?: string; category?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: VoucherDto[]; total: number }>('/finance/vouchers', { params }),
  getVoucherById: (id: string) => client.get<VoucherDto>(`/finance/vouchers/${id}`),
  createVoucher: (data: Partial<VoucherDto>) =>
    client.post<VoucherDto>('/finance/vouchers', data),
  approveVoucher: (id: string) => client.post(`/finance/vouchers/${id}/approve`),
  cancelVoucher: (id: string, reason: string) =>
    client.post(`/finance/vouchers/${id}/cancel`, { reason }),
  getBalanceReport: (params: { fromDate: string; toDate: string }) =>
    client.get<BalanceReportDto>('/finance/balance-report', { params }),
  getCashBook: (params: { month: number; year: number }) =>
    client.get('/finance/cash-book', { params }),
  getIncomeExpenseReport: (params: { year: number }) =>
    client.get('/finance/income-expense-report', { params }),
};
