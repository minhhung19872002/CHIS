import client from './client';

export interface AdmissionDto {
  id: string;
  patientId: string;
  patientName: string;
  admissionDate: string;
  departmentId?: string;
  departmentName?: string;
  bedId?: string;
  bedName?: string;
  admissionDiagnosis: string;
  admissionReason: string;
  status: number;
  dischargeDate?: string;
  dischargeDiagnosis?: string;
  dischargeStatus?: number;
  attendingDoctorId?: string;
  attendingDoctorName?: string;
}

export interface InpatientVitalDto {
  id?: string;
  admissionId: string;
  recordDate: string;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  spo2?: number;
  note?: string;
}

export interface TreatmentSheetDto {
  id?: string;
  admissionId: string;
  recordDate: string;
  dayNumber: number;
  clinicalProgress: string;
  orders: string;
  note?: string;
}

export interface CareSheetDto {
  id?: string;
  admissionId: string;
  recordDate: string;
  shift: string;
  patientCondition: string;
  nursingAssessment: string;
  interventions: string;
  response: string;
}

export const inpatientApi = {
  getAdmissions: (params?: { status?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: AdmissionDto[]; total: number }>('/inpatient/admissions', { params }),
  getById: (id: string) => client.get<AdmissionDto>(`/inpatient/admissions/${id}`),
  admit: (data: Partial<AdmissionDto>) => client.post<AdmissionDto>('/inpatient/admissions', data),
  discharge: (id: string, data: { dischargeDiagnosis: string; dischargeStatus: number }) =>
    client.post(`/inpatient/admissions/${id}/discharge`, data),
  getVitalSigns: (admissionId: string) =>
    client.get<InpatientVitalDto[]>(`/inpatient/${admissionId}/vitals`),
  saveVitalSign: (admissionId: string, data: InpatientVitalDto) =>
    client.post(`/inpatient/${admissionId}/vitals`, data),
  getTreatmentSheets: (admissionId: string) =>
    client.get<TreatmentSheetDto[]>(`/inpatient/${admissionId}/treatment-sheets`),
  saveTreatmentSheet: (admissionId: string, data: TreatmentSheetDto) =>
    client.post(`/inpatient/${admissionId}/treatment-sheets`, data),
  getCareSheets: (admissionId: string) =>
    client.get<CareSheetDto[]>(`/inpatient/${admissionId}/care-sheets`),
  saveCareSheet: (admissionId: string, data: CareSheetDto) =>
    client.post(`/inpatient/${admissionId}/care-sheets`, data),
  getPresenceList: () => client.get<AdmissionDto[]>('/inpatient/presence'),
  getBedMap: () => client.get('/inpatient/beds'),
};
