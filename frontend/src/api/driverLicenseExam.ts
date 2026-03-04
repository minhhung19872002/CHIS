import client from './client';

export interface DriverLicenseExamDto {
  id: string;
  patientName: string;
  dateOfBirth: string;
  gender: number;
  idNumber: string;
  phoneNumber?: string;
  address?: string;
  licenseClass: string;
  examDate: string;
  examType: string;
  eyesightLeft?: number;
  eyesightRight?: number;
  colorBlind: boolean;
  hearingTest: boolean;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  mentalHealth: boolean;
  physicalHealth: boolean;
  drugTest: boolean;
  alcoholTest: boolean;
  height?: number;
  weight?: number;
  overallResult: number;
  note?: string;
  doctorId?: string;
  doctorName?: string;
  certificateNumber?: string;
  status: number;
}

export interface DriverLicenseSearchParams {
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  licenseClass?: string;
  result?: number;
  pageIndex?: number;
  pageSize?: number;
}

export const driverLicenseExamApi = {
  search: (params: DriverLicenseSearchParams) =>
    client.get<{ items: DriverLicenseExamDto[]; total: number }>('/driver-license-exam', { params }),
  getById: (id: string) => client.get<DriverLicenseExamDto>(`/driver-license-exam/${id}`),
  create: (data: Partial<DriverLicenseExamDto>) => client.post('/driver-license-exam', data),
  update: (id: string, data: Partial<DriverLicenseExamDto>) => client.put(`/driver-license-exam/${id}`, data),
  approve: (id: string) => client.post(`/driver-license-exam/${id}/approve`),
  print: (id: string) => client.get(`/driver-license-exam/${id}/print`),
  getStatistics: (params: { month?: number; year?: number }) =>
    client.get('/driver-license-exam/statistics', { params }),
};
