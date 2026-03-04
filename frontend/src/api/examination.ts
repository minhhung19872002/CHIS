import client from './client';

export interface ExaminationDto {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  examDate: string;
  roomId?: string;
  roomName?: string;
  doctorId?: string;
  doctorName?: string;
  status: number;
  chiefComplaint?: string;
  presentIllness?: string;
  vitalSigns?: VitalSignsDto;
  mainDiagnosisCode?: string;
  mainDiagnosisName?: string;
  subDiagnoses?: string;
  treatmentPlan?: string;
  referral?: ReferralDto;
  sickLeave?: SickLeaveDto;
  insuranceNumber?: string;
  patientType: number;
}

export interface VitalSignsDto {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  spo2?: number;
  bmi?: number;
}

export interface ReferralDto {
  referToFacility?: string;
  referReason?: string;
  referDiagnosis?: string;
  transportMethod?: string;
}

export interface SickLeaveDto {
  fromDate?: string;
  toDate?: string;
  reason?: string;
  days?: number;
}

export interface ExamSearchDto {
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  status?: number;
  doctorId?: string;
  roomId?: string;
  pageIndex?: number;
  pageSize?: number;
}

// ---- Specialized Medical Records (14 types) ----

export interface SpecializedRecordDto {
  id: string;
  patientId: string;
  patientName?: string;
  patientCode?: string;
  medicalRecordId: string;
  recordType: string;
  recordTypeLabel?: string;
  recordData?: string;
  status: number;
  doctorId?: string;
  doctorName?: string;
  printedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSpecializedRecordDto {
  patientId: string;
  medicalRecordId: string;
  recordType: string;
  recordData?: string;
  doctorId?: string;
}

// ---- Tracking Books (8 types) ----

export interface TrackingBookEntryDto {
  id: string;
  patientId: string;
  patientName?: string;
  patientCode?: string;
  bookType: string;
  bookTypeLabel?: string;
  entryDate: string;
  notes?: string;
  entryData?: string;
  status: number;
  doctorId?: string;
  doctorName?: string;
  examinationId?: string;
  createdAt: string;
}

export interface CreateTrackingBookEntryDto {
  patientId: string;
  bookType: string;
  entryDate: string;
  notes?: string;
  entryData?: string;
  doctorId?: string;
  examinationId?: string;
}

// ---- Vital Sign Chart ----

export interface VitalSignChartDto {
  chartType: string;
  dataPoints: VitalSignChartPoint[];
}

export interface VitalSignChartPoint {
  date: string;
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  glucose?: number;
  spo2?: number;
}

// ---- Infusion / Oxytocin / Surgery Records ----

export interface InfusionRecordDto {
  id: string;
  patientId: string;
  patientName?: string;
  examinationId?: string;
  startTime: string;
  endTime?: string;
  solutionName?: string;
  volume?: number;
  flowRate?: number;
  notes?: string;
  status: number;
  createdAt: string;
}

export interface CreateInfusionRecordDto {
  patientId: string;
  examinationId?: string;
  startTime: string;
  solutionName?: string;
  volume?: number;
  flowRate?: number;
  notes?: string;
}

export interface OxytocinRecordDto {
  id: string;
  patientId: string;
  patientName?: string;
  examinationId?: string;
  startTime: string;
  endTime?: string;
  initialDose?: number;
  currentDose?: number;
  maxDose?: number;
  dilutionInfo?: string;
  fetalHeartRate?: number;
  contractionPattern?: string;
  systolicBP?: number;
  diastolicBP?: number;
  notes?: string;
  status: number;
  createdAt: string;
}

export interface CreateOxytocinRecordDto {
  patientId: string;
  examinationId?: string;
  startTime: string;
  initialDose?: number;
  maxDose?: number;
  dilutionInfo?: string;
  notes?: string;
}

export interface SurgeryRecordDto {
  id: string;
  patientId: string;
  patientName?: string;
  examinationId?: string;
  procedureDate: string;
  procedureName?: string;
  procedureType?: string;
  surgeon?: string;
  assistant?: string;
  anesthesia?: string;
  findings?: string;
  complications?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateSurgeryRecordDto {
  patientId: string;
  examinationId?: string;
  procedureDate: string;
  procedureName?: string;
  procedureType?: string;
  surgeon?: string;
  assistant?: string;
  anesthesia?: string;
  findings?: string;
  complications?: string;
  notes?: string;
}

// ---- Online Booking ----

export interface OnlineBookingDto {
  id: string;
  patientId: string;
  patientName?: string;
  patientCode?: string;
  patientPhone?: string;
  bookingDate: string;
  bookingTime?: string;
  roomId?: string;
  roomName?: string;
  status: number;
  notes?: string;
  source?: string;
  createdAt: string;
}

export interface OnlineBookingSearchDto {
  fromDate?: string;
  toDate?: string;
  status?: number;
  keyword?: string;
  pageIndex?: number;
  pageSize?: number;
}

// ---- Patient By Level ----

export interface ExamPatientByLevelDto {
  patientId: string;
  patientName?: string;
  patientCode?: string;
  level?: string;
  diagnosis?: string;
  lastVisit?: string;
  visitCount: number;
}

// ---- Record / Book Type Reference ----

export interface TypeOption {
  value: string;
  label: string;
}

export const RECORD_TYPES: TypeOption[] = [
  { value: 'OutpatientRecord', label: 'Ngoai tru' },
  { value: 'InternalMedicine', label: 'Noi khoa' },
  { value: 'NursingRehab', label: 'Dieu duong PHCN' },
  { value: 'Obstetric', label: 'San khoa' },
  { value: 'Neonatal', label: 'So sinh' },
  { value: 'Psychiatric', label: 'Tam than' },
  { value: 'Hypertension', label: 'Tang huyet ap' },
  { value: 'TraditionalMedicine', label: 'YHCT' },
  { value: 'Diabetes', label: 'Tieu duong' },
  { value: 'Dental', label: 'Rang ham mat' },
  { value: 'HandFootMouth', label: 'Tay chan mieng' },
  { value: 'Abortion', label: 'Pha thai' },
  { value: 'DetailedRecord', label: 'Chi tiet' },
  { value: 'ChronicTreatment', label: 'To dieu tri man tinh' },
];

export const TRACKING_BOOK_TYPES: TypeOption[] = [
  { value: 'Tuberculosis', label: 'Lao' },
  { value: 'Psychiatric', label: 'Tam than' },
  { value: 'Malaria', label: 'Sot ret' },
  { value: 'HIV', label: 'HIV' },
  { value: 'NCD', label: 'Benh KLN' },
  { value: 'Gynecology', label: 'Phu khoa' },
  { value: 'FamilyPlanning', label: 'KHHGD' },
  { value: 'ChronicOutpatient', label: 'Ngoai tru man tinh' },
];

// ============================================================
// API CLIENT
// ============================================================

export const examinationApi = {
  // ---- Existing ----
  search: (params: ExamSearchDto) =>
    client.get<{ items: ExaminationDto[]; total: number }>('/examination', { params }),
  getById: (id: string) => client.get<ExaminationDto>(`/examination/${id}`),
  create: (data: Partial<ExaminationDto>) => client.post<ExaminationDto>('/examination', data),
  update: (id: string, data: Partial<ExaminationDto>) => client.put(`/examination/${id}`, data),
  saveVitalSigns: (id: string, data: VitalSignsDto) =>
    client.put(`/examination/${id}/vital-signs`, data),
  saveDiagnosis: (id: string, data: { mainCode: string; mainName: string; subDiagnoses?: string }) =>
    client.put(`/examination/${id}/diagnosis`, data),
  saveReferral: (id: string, data: ReferralDto) =>
    client.post(`/examination/${id}/referral`, data),
  saveSickLeave: (id: string, data: SickLeaveDto) =>
    client.post(`/examination/${id}/sick-leave`, data),
  complete: (id: string) => client.post(`/examination/${id}/complete`),
  getDiseaseBooks: (params: { fromDate?: string; toDate?: string }) =>
    client.get('/examination/disease-books', { params }),
  getQueueList: (roomId?: string) =>
    client.get('/examination/queue', { params: { roomId } }),

  // ---- Specialized Medical Records (14 types) ----
  getSpecializedRecords: (patientId: string, recordType?: string) =>
    client.get<SpecializedRecordDto[]>('/examination/specialized-records', { params: { patientId, recordType } }),
  createSpecializedRecord: (data: CreateSpecializedRecordDto) =>
    client.post<SpecializedRecordDto>('/examination/specialized-records', data),
  updateSpecializedRecord: (id: string, data: CreateSpecializedRecordDto) =>
    client.put<SpecializedRecordDto>(`/examination/specialized-records/${id}`, data),
  deleteSpecializedRecord: (id: string) =>
    client.delete(`/examination/specialized-records/${id}`),
  printSpecializedRecord: (id: string) =>
    client.get(`/examination/specialized-records/${id}/print`, { responseType: 'blob' }),

  // ---- Tracking Books (8 types) ----
  getTrackingBookEntries: (patientId: string, bookType: string) =>
    client.get<TrackingBookEntryDto[]>('/examination/tracking-books', { params: { patientId, bookType } }),
  createTrackingBookEntry: (data: CreateTrackingBookEntryDto) =>
    client.post<TrackingBookEntryDto>('/examination/tracking-books', data),
  updateTrackingBookEntry: (id: string, data: CreateTrackingBookEntryDto) =>
    client.put<TrackingBookEntryDto>(`/examination/tracking-books/${id}`, data),
  deleteTrackingBookEntry: (id: string) =>
    client.delete(`/examination/tracking-books/${id}`),

  // ---- Vital Sign Charts ----
  getVitalSignChart: (patientId: string, chartType: string, from: string, to: string) =>
    client.get<VitalSignChartDto>('/examination/vital-chart', { params: { patientId, chartType, from, to } }),

  // ---- Infusion / Oxytocin / Surgery Records ----
  createInfusionRecord: (data: CreateInfusionRecordDto) =>
    client.post<InfusionRecordDto>('/examination/infusion-records', data),
  createOxytocinRecord: (data: CreateOxytocinRecordDto) =>
    client.post<OxytocinRecordDto>('/examination/oxytocin-records', data),
  createSurgeryRecord: (data: CreateSurgeryRecordDto) =>
    client.post<SurgeryRecordDto>('/examination/surgery-records', data),

  // ---- Patient Type Change ----
  changePatientType: (id: string, data: { newType: string; reason?: string }) =>
    client.put(`/examination/${id}/change-type`, data),

  // ---- Online Bookings ----
  getOnlineBookings: (params: OnlineBookingSearchDto) =>
    client.get<{ items: OnlineBookingDto[]; totalCount: number }>('/examination/online-bookings', { params }),

  // ---- Patients by Level ----
  getPatientsByLevel: (level: string) =>
    client.get<ExamPatientByLevelDto[]>('/examination/patients-by-level', { params: { level } }),

  // ---- Reference Data ----
  getRecordTypes: () =>
    client.get<TypeOption[]>('/examination/record-types'),
  getTrackingBookTypes: () =>
    client.get<TypeOption[]>('/examination/tracking-book-types'),
};
