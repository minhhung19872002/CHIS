import client from './client';

export interface ImmunizationSubjectDto {
  id: string;
  subjectCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: number;
  motherName?: string;
  address?: string;
  village?: string;
  phone?: string;
  vaccinationCount: number;
}

export interface CreateImmunizationSubjectDto {
  fullName: string;
  dateOfBirth: string;
  gender: number;
  motherName?: string;
  fatherName?: string;
  address?: string;
  village?: string;
  phone?: string;
}

export interface VaccinationRecordDto {
  id: string;
  subjectId: string;
  subjectName?: string;
  vaccineId: string;
  vaccineName?: string;
  vaccinationDate: string;
  doseNumber: number;
  batchNumber?: string;
  injectionSite?: string;
  route?: string;
  reaction?: string;
  reactionDetail?: string;
}

export interface CreateVaccinationRecordDto {
  subjectId: string;
  vaccineId: string;
  doseNumber: number;
  batchNumber?: string;
  injectionSite?: string;
  route?: string;
}

export interface VaccineDto {
  id: string;
  code: string;
  name: string;
  manufacturer?: string;
  antigenList?: string;
  storageCondition?: string;
  dosesPerVial?: number;
  isActive: boolean;
}

export interface VaccineStockDto {
  id: string;
  stockCode: string;
  vaccineId: string;
  vaccineName?: string;
  stockType?: string;
  stockDate: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface NutritionMeasurementDto {
  id: string;
  subjectId: string;
  subjectName?: string;
  measurementDate: string;
  weight?: number;
  height?: number;
  headCircumference?: number;
  nutritionStatus?: string;
}

export interface VaccineStockIssueDto {
  id: string;
  issueCode?: string;
  issueType: string;
  vaccineId: string;
  vaccineName?: string;
  quantity: number;
  issueDate: string;
  reason?: string;
  batchNumber?: string;
  notes?: string;
  status: number;
}

export interface CreateVaccineStockIssueDto {
  issueType: string;
  vaccineId: string;
  quantity: number;
  reason?: string;
  batchNumber?: string;
  notes?: string;
}

export interface ImmunReportDto {
  id: string;
  reportCode: string;
  year: number;
  month?: number;
  quarter?: number;
  facilityId?: string;
  facilityName?: string;
  data?: string;
  status: number;
  sentDate?: string;
}

export interface ChildAgeStatsDto {
  under1Year: number;
  from1To2Years: number;
  from2To5Years: number;
  above5Years: number;
  totalSubjects: number;
  fullyVaccinated: number;
  partiallyVaccinated: number;
}

export const immunizationApi = {
  // Subjects
  getSubjects: (params: { keyword?: string; village?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: ImmunizationSubjectDto[]; totalCount: number }>('/immunization/subjects', { params }),
  getSubjectById: (id: string) => client.get<ImmunizationSubjectDto>(`/immunization/subjects/${id}`),
  createSubject: (data: CreateImmunizationSubjectDto) =>
    client.post('/immunization/subjects', data),

  // Vaccinations
  getVaccinations: (subjectId: string) =>
    client.get<VaccinationRecordDto[]>(`/immunization/subjects/${subjectId}/vaccinations`),
  recordVaccination: (data: CreateVaccinationRecordDto) =>
    client.post('/immunization/vaccinations', data),

  // Vaccines
  getVaccines: () => client.get<VaccineDto[]>('/immunization/vaccines'),
  createVaccine: (data: VaccineDto) =>
    client.post('/immunization/vaccines', data),

  // Vaccine stock
  getVaccineStock: (vaccineId?: string) =>
    client.get<VaccineStockDto[]>('/immunization/vaccine-stock', { params: { vaccineId } }),

  // Nutrition
  getNutritionMeasurements: (subjectId: string) =>
    client.get<NutritionMeasurementDto[]>(`/immunization/subjects/${subjectId}/nutrition`),
  recordMeasurement: (subjectId: string, data: NutritionMeasurementDto) =>
    client.post(`/immunization/subjects/${subjectId}/nutrition`, data),

  // Vaccine stock issues
  createVaccineStockIssue: (data: CreateVaccineStockIssueDto) =>
    client.post<VaccineStockIssueDto>('/immunization/vaccine-stock-issues', data),
  getVaccineStockIssues: (params?: { issueType?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: VaccineStockIssueDto[]; totalCount: number }>('/immunization/vaccine-stock-issues', { params }),

  // Reports
  getReport: (reportCode: string, params: { year: number; month?: number; quarter?: number; facilityId?: string }) =>
    client.get<ImmunReportDto>(`/immunization/reports/${reportCode}`, { params }),
  sendReport: (reportCode: string, reportId: string) =>
    client.post(`/immunization/reports/${reportCode}/${reportId}/send`),

  // Print
  printBarcode: (subjectId: string) =>
    client.get(`/immunization/subjects/${subjectId}/barcode`, { responseType: 'blob' }),
  printAppointmentSlip: (planId: string) =>
    client.get(`/immunization/plans/${planId}/appointment-slip`, { responseType: 'blob' }),

  // Child stats
  getChildStats: (facilityId?: string) =>
    client.get<ChildAgeStatsDto>('/immunization/child-stats', { params: { facilityId } }),
};
