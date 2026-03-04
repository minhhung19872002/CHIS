import client from './client';

export interface DiseaseCaseDto {
  id: string;
  patientId?: string;
  patientName: string;
  dateOfBirth: string;
  gender: number;
  address: string;
  diseaseCode: string;
  diseaseName: string;
  onsetDate: string;
  reportDate: string;
  diagnosisDate?: string;
  hospitalized: boolean;
  outcome?: string;
  deathDate?: string;
  labConfirmed: boolean;
  contactTracing?: string;
  reportedBy: string;
  status: number;
}

export interface WeeklyReportDto {
  weekNumber: number;
  year: number;
  diseases: { diseaseName: string; newCases: number; deaths: number; cumulative: number }[];
  submittedDate?: string;
  status: string;
}

export const communicableDiseaseApi = {
  getCases: (params: { keyword?: string; diseaseCode?: string; fromDate?: string; toDate?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: DiseaseCaseDto[]; total: number }>('/communicable-disease/cases', { params }),
  getCaseById: (id: string) => client.get<DiseaseCaseDto>(`/communicable-disease/cases/${id}`),
  reportCase: (data: Partial<DiseaseCaseDto>) =>
    client.post('/communicable-disease/cases', data),
  updateCase: (id: string, data: Partial<DiseaseCaseDto>) =>
    client.put(`/communicable-disease/cases/${id}`, data),
  getWeeklyReports: (params?: { year?: number }) =>
    client.get<WeeklyReportDto[]>('/communicable-disease/weekly-reports', { params }),
  submitWeeklyReport: (data: { weekNumber: number; year: number }) =>
    client.post('/communicable-disease/weekly-reports', data),
  getMonthlyReport: (params: { month: number; year: number }) =>
    client.get('/communicable-disease/monthly-report', { params }),
  getDiseaseSurveillance: () => client.get('/communicable-disease/surveillance'),
};
