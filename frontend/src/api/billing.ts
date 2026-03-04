import client from './client';

export interface BillingDto {
  id: string;
  patientId: string;
  patientName: string;
  examinationId: string;
  insuranceNumber?: string;
  totalAmount: number;
  insurancePay: number;
  copay: number;
  patientPay: number;
  status: number;
  paymentDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  items: BillingItemDto[];
}

export interface BillingItemDto {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  insuranceRate: number;
  insurancePay: number;
  patientPay: number;
  category: string;
}

export interface BillingSearchDto {
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  status?: number;
  paymentMethod?: string;
  pageIndex?: number;
  pageSize?: number;
}

export const billingApi = {
  search: (params: BillingSearchDto) =>
    client.get<{ items: BillingDto[]; total: number }>('/billing', { params }),
  getById: (id: string) => client.get<BillingDto>(`/billing/${id}`),
  calculateFees: (examinationId: string) =>
    client.get<BillingDto>(`/billing/calculate/${examinationId}`),
  confirmInsurance: (id: string) => client.post(`/billing/${id}/confirm-insurance`),
  collectPayment: (id: string, data: { paymentMethod: string; amount: number }) =>
    client.post(`/billing/${id}/collect`, data),
  cancelPayment: (id: string, reason: string) =>
    client.post(`/billing/${id}/cancel`, { reason }),
  printReceipt: (id: string) => client.get(`/billing/${id}/print-receipt`, { responseType: 'blob' }),
  getDailyReport: (date: string) => client.get('/billing/daily-report', { params: { date } }),
  getInsuranceReport: (params: { fromDate: string; toDate: string }) =>
    client.get('/billing/insurance-report', { params }),
};
