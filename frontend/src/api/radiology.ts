import client from './client';

export interface RadiologyOrderDto {
  id: string;
  patientId: string;
  patientName: string;
  examinationId: string;
  orderDate: string;
  doctorName: string;
  status: number;
  modality: string;
  bodyPart: string;
  clinicalInfo?: string;
  result?: string;
  conclusion?: string;
  reportDoctorName?: string;
  images?: string[];
}

export const radiologyApi = {
  getOrders: (params?: { fromDate?: string; toDate?: string; status?: number; modality?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: RadiologyOrderDto[]; total: number }>('/radiology/orders', { params }),
  getOrderById: (id: string) => client.get<RadiologyOrderDto>(`/radiology/orders/${id}`),
  createOrder: (data: { examinationId: string; modality: string; bodyPart: string; clinicalInfo?: string }) =>
    client.post<RadiologyOrderDto>('/radiology/orders', data),
  enterResult: (id: string, data: { result: string; conclusion: string }) =>
    client.post(`/radiology/orders/${id}/result`, data),
  approve: (id: string) => client.post(`/radiology/orders/${id}/approve`),
  getTemplates: (modality: string) => client.get(`/radiology/templates/${modality}`),
  getReport: (params: { fromDate: string; toDate: string }) =>
    client.get('/radiology/reports', { params }),
};
