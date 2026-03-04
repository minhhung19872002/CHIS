import client from './client';

export interface PrenatalRecordDto {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  address: string;
  gestationalAge: number;
  expectedDueDate: string;
  lastPeriodDate: string;
  gravida: number;
  para: number;
  riskLevel: number;
  visits: PrenatalVisitDto[];
  status: number;
}

export interface PrenatalVisitDto {
  id: string;
  visitDate: string;
  gestationalWeek: number;
  weight: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  fundalHeight?: number;
  fetalHeartRate?: number;
  presentation?: string;
  urineProtein?: string;
  hemoglobin?: number;
  note?: string;
  doctorName: string;
}

export interface DeliveryRecordDto {
  id: string;
  prenatalId?: string;
  patientName: string;
  deliveryDate: string;
  gestationalAge: number;
  deliveryMethod: string;
  outcome: string;
  birthWeight: number;
  apgarScore1?: number;
  apgarScore5?: number;
  complications?: string;
  attendantName: string;
}

export interface FamilyPlanningDto {
  id: string;
  patientId: string;
  patientName: string;
  method: string;
  startDate: string;
  endDate?: string;
  status: string;
  sideEffects?: string;
  nextVisitDate?: string;
}

export const reproductiveHealthApi = {
  getPrenatalRecords: (params: { keyword?: string; riskLevel?: number; status?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: PrenatalRecordDto[]; total: number }>('/reproductive-health/prenatal', { params }),
  getPrenatalById: (id: string) => client.get<PrenatalRecordDto>(`/reproductive-health/prenatal/${id}`),
  createPrenatal: (data: Partial<PrenatalRecordDto>) =>
    client.post('/reproductive-health/prenatal', data),
  addPrenatalVisit: (prenatalId: string, data: Partial<PrenatalVisitDto>) =>
    client.post(`/reproductive-health/prenatal/${prenatalId}/visits`, data),
  getDeliveries: (params?: { fromDate?: string; toDate?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: DeliveryRecordDto[]; total: number }>('/reproductive-health/deliveries', { params }),
  recordDelivery: (data: Partial<DeliveryRecordDto>) =>
    client.post('/reproductive-health/deliveries', data),
  getFamilyPlanning: (params?: { method?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: FamilyPlanningDto[]; total: number }>('/reproductive-health/family-planning', { params }),
  createFamilyPlanning: (data: Partial<FamilyPlanningDto>) =>
    client.post('/reproductive-health/family-planning', data),
  getAbortionRecords: (params?: { fromDate?: string; toDate?: string; pageIndex?: number; pageSize?: number }) =>
    client.get('/reproductive-health/abortions', { params }),
  getGynecologyRecords: (params?: { pageIndex?: number; pageSize?: number }) =>
    client.get('/reproductive-health/gynecology', { params }),
  getStatistics: (params?: { year?: number }) =>
    client.get('/reproductive-health/statistics', { params }),
};
