import client from './client';

export interface PatientDto {
  id: string;
  code: string;
  fullName: string;
  dateOfBirth: string;
  gender: number;
  idNumber?: string;
  phoneNumber?: string;
  address?: string;
  wardId?: string;
  districtId?: string;
  provinceId?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  ethnicGroup?: string;
  occupation?: string;
  householdId?: string;
  isActive: boolean;
}

export interface PatientSearchDto {
  keyword?: string;
  gender?: number;
  hasInsurance?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

export const patientApi = {
  search: (params: PatientSearchDto) => client.get<{ items: PatientDto[]; total: number }>('/patients', { params }),
  getById: (id: string) => client.get<PatientDto>(`/patients/${id}`),
  create: (data: Partial<PatientDto>) => client.post<PatientDto>('/patients', data),
  update: (id: string, data: Partial<PatientDto>) => client.put(`/patients/${id}`, data),
  getHistory: (id: string) => client.get(`/patients/${id}/history`),
  getMedicalRecords: (id: string) => client.get(`/patients/${id}/medical-records`),
};
