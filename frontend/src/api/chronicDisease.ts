import client from './client';

export interface ChronicDiseaseRegisterDto {
  id: string;
  patientId: string;
  patientName?: string;
  patientCode?: string;
  diseaseType: string;
  registerDate: string;
  status?: string;
  notes?: string;
  treatmentCount: number;
}

export interface CreateChronicDiseaseRegisterDto {
  patientId: string;
  diseaseType: string;
  notes?: string;
}

export interface ChronicDiseaseTreatmentDto {
  id: string;
  registerId: string;
  treatmentDate: string;
  progress?: string;
  orders?: string;
  vitalSigns?: string;
  notes?: string;
  doctorId?: string;
  doctorName?: string;
}

export interface CreateChronicDiseaseTreatmentDto {
  registerId: string;
  progress?: string;
  orders?: string;
  vitalSigns?: string;
  notes?: string;
}

export interface ChronicDiseaseSearchDto {
  keyword?: string;
  diseaseType?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}

// NCD Examination
export interface NcdExaminationDto {
  id: string;
  registerId: string;
  patientName?: string;
  diseaseType?: string;
  examDate: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bloodGlucose?: number;
  hbA1c?: number;
  cholesterol?: number;
  triglycerides?: number;
  creatinine?: number;
  diagnosis?: string;
  icdCode?: string;
  assessment?: string;
  treatmentPlan?: string;
  medications?: string;
  notes?: string;
  nextVisitDate?: string;
  doctorId?: string;
  doctorName?: string;
}

export interface CreateNcdExaminationDto {
  registerId: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bloodGlucose?: number;
  hbA1c?: number;
  cholesterol?: number;
  triglycerides?: number;
  creatinine?: number;
  diagnosis?: string;
  icdCode?: string;
  assessment?: string;
  treatmentPlan?: string;
  medications?: string;
  notes?: string;
  nextVisitDate?: string;
}

// Referral
export interface NcdReferralDto {
  id: string;
  registerId: string;
  patientName?: string;
  referralDate: string;
  toFacility?: string;
  reason?: string;
  diagnosis?: string;
  treatmentSummary?: string;
  notes?: string;
}

export interface CreateNcdReferralDto {
  registerId: string;
  toFacility?: string;
  reason?: string;
  diagnosis?: string;
  treatmentSummary?: string;
  notes?: string;
}

// Sick Leave
export interface NcdSickLeaveDto {
  id: string;
  registerId: string;
  patientName?: string;
  fromDate: string;
  toDate: string;
  days: number;
  diagnosis?: string;
  doctorName?: string;
}

export interface CreateNcdSickLeaveDto {
  registerId: string;
  fromDate: string;
  toDate: string;
  diagnosis?: string;
}

// Tracking book
export interface NcdTrackingBookDto {
  bookType: string;
  totalPatients: number;
  activePatients: number;
  treatedPatients: number;
  defaultedPatients: number;
  entries: NcdTrackingEntryDto[];
}

export interface NcdTrackingEntryDto {
  patientId: string;
  patientName?: string;
  patientCode?: string;
  diseaseType?: string;
  registerDate: string;
  lastVisitDate?: string;
  nextVisitDate?: string;
  status?: string;
  currentTreatment?: string;
}

// Chart data
export interface BPChartPointDto {
  date: string;
  systolic?: number;
  diastolic?: number;
}

export interface GlucoseChartPointDto {
  date: string;
  glucose?: number;
  hbA1c?: number;
}

export const chronicDiseaseApi = {
  // Register management
  search: (params: ChronicDiseaseSearchDto) =>
    client.get<{ items: ChronicDiseaseRegisterDto[]; totalCount: number }>('/chronic-disease', { params }),
  getById: (id: string) => client.get<ChronicDiseaseRegisterDto>(`/chronic-disease/${id}`),
  register: (data: CreateChronicDiseaseRegisterDto) =>
    client.post<ChronicDiseaseRegisterDto>('/chronic-disease', data),
  updateStatus: (id: string, status: string) =>
    client.put(`/chronic-disease/${id}/status`, null, { params: { status } }),

  // Treatments
  getTreatments: (registerId: string) =>
    client.get<ChronicDiseaseTreatmentDto[]>(`/chronic-disease/${registerId}/treatments`),
  addTreatment: (data: CreateChronicDiseaseTreatmentDto) =>
    client.post<ChronicDiseaseTreatmentDto>('/chronic-disease/treatments', data),

  // NCD Examinations
  createNcdExamination: (data: CreateNcdExaminationDto) =>
    client.post<NcdExaminationDto>('/chronic-disease/examinations', data),
  getNcdExaminations: (registerId: string) =>
    client.get<NcdExaminationDto[]>(`/chronic-disease/${registerId}/examinations`),

  // Referrals
  createReferral: (data: CreateNcdReferralDto) =>
    client.post<NcdReferralDto>('/chronic-disease/referrals', data),

  // Sick Leaves
  createSickLeave: (data: CreateNcdSickLeaveDto) =>
    client.post<NcdSickLeaveDto>('/chronic-disease/sick-leaves', data),

  // Tracking books
  getTrackingBook: (bookType: string, facilityId?: string) =>
    client.get<NcdTrackingBookDto>(`/chronic-disease/tracking-books/${bookType}`, { params: { facilityId } }),

  // Chart data
  getBPChartData: (registerId: string) =>
    client.get<BPChartPointDto[]>(`/chronic-disease/${registerId}/bp-chart`),
  getGlucoseChartData: (registerId: string) =>
    client.get<GlucoseChartPointDto[]>(`/chronic-disease/${registerId}/glucose-chart`),
};
