import client from './client';

// ---- Types ----

export interface ReportFilterParams {
  year?: number;
  month?: number;
  quarter?: number;
  fromDate?: string;
  toDate?: string;
  facilityId?: string;
  departmentId?: string;
  reportType?: string;
}

export interface ReportExportParams {
  format: 'excel' | 'pdf';
  reportType: string;
  filter: ReportFilterParams;
}

// ---- Dashboard & Basic Statistics ----

export const getDashboard = (facilityId?: string) =>
  client.get('/report/dashboard', { params: { facilityId } });

export const getMonthlyStatistics = (year: number, month: number, facilityId?: string) =>
  client.get('/report/monthly', { params: { year, month, facilityId } });

export const getDiseaseStatistics = (fromDate: string, toDate: string, facilityId?: string) =>
  client.get('/report/diseases', { params: { fromDate, toDate, facilityId } });

export const getImmunizationCoverage = (year: number, facilityId?: string) =>
  client.get('/report/immunization-coverage', { params: { year, facilityId } });

// ---- BCX Reports (tuyen xa, Bieu 1-10) ----

export const getBcxReport = (number: number, filter: ReportFilterParams) =>
  client.get(`/report/bcx/${number}`, { params: filter });

// ---- BCH Reports (tuyen huyen, Bieu 1-16) ----

export const getBchReport = (number: number, filter: ReportFilterParams) =>
  client.get(`/report/bch/${number}`, { params: filter });

// ---- BCX TT37 Reports (tuyen xa TT37, Bieu 1-8) ----

export const getBcxTT37Report = (number: number, filter: ReportFilterParams) =>
  client.get(`/report/bcx-tt37/${number}`, { params: filter });

// ---- BCH TT37 Reports (tuyen huyen TT37, Bieu 1-14) ----

export const getBchTT37Report = (number: number, filter: ReportFilterParams) =>
  client.get(`/report/bch-tt37/${number}`, { params: filter });

// ---- BHYT Reports ----

export const getBhytReport = (mau: string, filter: ReportFilterParams) =>
  client.get(`/report/bhyt/${mau}`, { params: filter });

// ---- So YTCS (A1-A12) ----

export const getSoYtcs = (soType: string, filter: ReportFilterParams) =>
  client.get(`/report/so-ytcs/${soType}`, { params: filter });

// ---- BHYT Summary ----

export const getBhytSummary = (filter: ReportFilterParams) =>
  client.get('/report/bhyt-summary', { params: filter });

// ---- Additional Statistics ----

export const getDiseaseStatisticsReport = (filter: ReportFilterParams) =>
  client.get('/report/disease-statistics', { params: filter });

export const getNcdStatistics = (filter: ReportFilterParams) =>
  client.get('/report/ncd-statistics', { params: filter });

export const getBillingSummary = (filter: ReportFilterParams) =>
  client.get('/report/billing-summary', { params: filter });

export const getGeneralSummary = (filter: ReportFilterParams) =>
  client.get('/report/general-summary', { params: filter });

export const getPatientByLevel = (filter: ReportFilterParams) =>
  client.get('/report/patient-by-level', { params: filter });

export const getUtilityReport = (filter: ReportFilterParams) =>
  client.get('/report/utility', { params: filter });

export const getPharmacyReport = (filter: ReportFilterParams) =>
  client.get('/report/pharmacy', { params: filter });

// ---- Export ----

export const exportReport = (params: ReportExportParams) =>
  client.post('/report/export', params, {
    responseType: params.format === 'pdf' ? 'blob' : 'blob',
  });

// ---- Convenience: grouped API object for backward compatibility ----

export const reportApi = {
  getDashboard,
  getMonthlyStatistics,
  getDiseaseStatistics,
  getImmunizationCoverage,
  getBcxReport,
  getBchReport,
  getBcxTT37Report,
  getBchTT37Report,
  getBhytReport,
  getSoYtcs,
  getBhytSummary,
  getDiseaseStatisticsReport,
  getNcdStatistics,
  getBillingSummary,
  getGeneralSummary,
  getPatientByLevel,
  getUtilityReport,
  getPharmacyReport,
  exportReport,
};
