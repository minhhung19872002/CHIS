import client from './client';

export interface PrescriptionDto {
  id: string;
  examinationId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  prescriptionDate: string;
  status: number;
  totalAmount: number;
  insuranceCovered: number;
  patientPay: number;
  items: PrescriptionItemDto[];
  note?: string;
}

export interface PrescriptionItemDto {
  id: string;
  medicineId: string;
  medicineName: string;
  unit: string;
  quantity: number;
  dosage: string;
  frequency: string;
  route: string;
  duration: number;
  morningDose?: number;
  noonDose?: number;
  afternoonDose?: number;
  eveningDose?: number;
  unitPrice: number;
  totalPrice: number;
  insuranceRate: number;
  note?: string;
}

export const prescriptionApi = {
  getByExamination: (examId: string) =>
    client.get<PrescriptionDto>(`/prescriptions/examination/${examId}`),
  create: (data: Partial<PrescriptionDto>) => client.post<PrescriptionDto>('/prescriptions', data),
  update: (id: string, data: Partial<PrescriptionDto>) =>
    client.put(`/prescriptions/${id}`, data),
  delete: (id: string) => client.delete(`/prescriptions/${id}`),
  getTemplates: () => client.get<PrescriptionDto[]>('/prescriptions/templates'),
  checkInteractions: (medicineIds: string[]) =>
    client.post('/prescriptions/check-interactions', { medicineIds }),
};
