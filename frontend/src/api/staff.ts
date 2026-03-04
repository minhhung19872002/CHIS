import client from './client';

export interface StaffDto {
  id: string;
  code: string;
  fullName: string;
  dateOfBirth?: string;
  gender: number;
  position: string;
  department?: string;
  qualification?: string;
  specialization?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  email?: string;
  startDate?: string;
  status: number;
  canPrescribe: boolean;
  digitalSignatureId?: string;
  electronicPrescriptionMapping?: string;
}

export const staffApi = {
  getList: (params?: { keyword?: string; position?: string; status?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: StaffDto[]; total: number }>('/staff', { params }),
  getById: (id: string) => client.get<StaffDto>(`/staff/${id}`),
  create: (data: Partial<StaffDto>) => client.post('/staff', data),
  update: (id: string, data: Partial<StaffDto>) => client.put(`/staff/${id}`, data),
  delete: (id: string) => client.delete(`/staff/${id}`),
  mapPrescription: (id: string, mapping: string) =>
    client.put(`/staff/${id}/prescription-mapping`, { mapping }),
  getDoctors: () => client.get<StaffDto[]>('/staff/doctors'),
};
