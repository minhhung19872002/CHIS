import client from './client';

export interface HivPatientDto {
  id: string;
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  gender: number;
  address: string;
  diagnosisDate: string;
  clinicalStage: number;
  cd4Count?: number;
  viralLoad?: number;
  arvRegimen?: string;
  arvStartDate?: string;
  adherenceRate?: number;
  status: number;
  familyMembers: HivFamilyMemberDto[];
}

export interface HivFamilyMemberDto {
  id: string;
  fullName: string;
  relationship: string;
  hivStatus: string;
  testDate?: string;
  onArv: boolean;
}

export interface ArvRecordDto {
  id: string;
  patientId: string;
  regimen: string;
  startDate: string;
  endDate?: string;
  dispensedDate: string;
  dispensedDays: number;
  cd4?: number;
  viralLoad?: number;
  sideEffects?: string;
  adherence: string;
}

export const hivAidsApi = {
  getPatients: (params: { keyword?: string; status?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: HivPatientDto[]; total: number }>('/hiv-aids/patients', { params }),
  getById: (id: string) => client.get<HivPatientDto>(`/hiv-aids/patients/${id}`),
  register: (data: Partial<HivPatientDto>) =>
    client.post('/hiv-aids/patients', data),
  update: (id: string, data: Partial<HivPatientDto>) =>
    client.put(`/hiv-aids/patients/${id}`, data),
  addFamilyMember: (patientId: string, data: Partial<HivFamilyMemberDto>) =>
    client.post(`/hiv-aids/patients/${patientId}/family`, data),
  getArvHistory: (patientId: string) =>
    client.get<ArvRecordDto[]>(`/hiv-aids/patients/${patientId}/arv-history`),
  recordArvDispensing: (data: Partial<ArvRecordDto>) =>
    client.post('/hiv-aids/arv-dispensing', data),
  getStatistics: (params?: { year?: number }) =>
    client.get('/hiv-aids/statistics', { params }),
  getReport: (params: { quarter: number; year: number }) =>
    client.get('/hiv-aids/reports', { params }),
};
