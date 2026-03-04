import client from './client';

export interface LabOrderDto {
  id: string;
  patientId: string;
  patientName: string;
  examinationId: string;
  orderDate: string;
  doctorName: string;
  status: number;
  items: LabOrderItemDto[];
}

export interface LabOrderItemDto {
  id: string;
  testId: string;
  testName: string;
  testGroup: string;
  result?: string;
  unit?: string;
  normalRange?: string;
  isAbnormal?: boolean;
  status: number;
  note?: string;
}

export interface LabResultDto {
  id: string;
  orderId: string;
  testName: string;
  result: string;
  unit: string;
  normalRange: string;
  isAbnormal: boolean;
  approvedBy?: string;
  approvedDate?: string;
}

export const labApi = {
  getOrders: (params?: { fromDate?: string; toDate?: string; status?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: LabOrderDto[]; total: number }>('/lab/orders', { params }),
  getOrderById: (id: string) => client.get<LabOrderDto>(`/lab/orders/${id}`),
  createOrder: (data: { examinationId: string; testIds: string[] }) =>
    client.post<LabOrderDto>('/lab/orders', data),
  enterResults: (orderId: string, results: { itemId: string; result: string; note?: string }[]) =>
    client.post(`/lab/orders/${orderId}/results`, { results }),
  approveResults: (orderId: string) => client.post(`/lab/orders/${orderId}/approve`),
  getTestCatalog: () => client.get('/lab/tests'),
  getReferenceValues: (testId: string) => client.get(`/lab/tests/${testId}/reference-values`),
  getReport: (params: { fromDate: string; toDate: string; groupBy?: string }) =>
    client.get('/lab/reports', { params }),
};
