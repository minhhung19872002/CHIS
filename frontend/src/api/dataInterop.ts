import client from './client';

export interface SyncJobDto {
  id: string;
  jobType: string;
  direction: 'upload' | 'download';
  status: string;
  startTime: string;
  endTime?: string;
  recordCount: number;
  successCount: number;
  errorCount: number;
  errorMessage?: string;
}

export interface InsuranceClaimDto {
  id: string;
  patientName: string;
  insuranceNumber: string;
  examinationDate: string;
  totalAmount: number;
  claimAmount: number;
  status: string;
  syncStatus: string;
  errorCode?: string;
}

export const dataInteropApi = {
  getBhytSyncStatus: () => client.get('/data-interop/bhyt/status'),
  syncBhytClaims: (params: { fromDate: string; toDate: string }) =>
    client.post('/data-interop/bhyt/sync', params),
  getBhytClaims: (params: { fromDate?: string; toDate?: string; status?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: InsuranceClaimDto[]; total: number }>('/data-interop/bhyt/claims', { params }),
  checkInsuranceCard: (insuranceNumber: string) =>
    client.get(`/data-interop/bhyt/check-card/${insuranceNumber}`),
  getHsskStatus: () => client.get('/data-interop/hssk/status'),
  syncHssk: () => client.post('/data-interop/hssk/sync'),
  getV20Status: () => client.get('/data-interop/v20/status'),
  syncV20: (params: { month: number; year: number }) =>
    client.post('/data-interop/v20/sync', params),
  getSyncHistory: (params?: { jobType?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: SyncJobDto[]; total: number }>('/data-interop/sync-history', { params }),
};
