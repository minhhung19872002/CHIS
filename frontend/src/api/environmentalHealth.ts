import client from './client';

export interface SanitationFacilityDto {
  id: string;
  householdId: string;
  householdHead: string;
  address: string;
  facilityType: string;
  condition: string;
  meetsStandard: boolean;
  inspectionDate: string;
  inspectorName: string;
  note?: string;
}

export interface WaterSourceDto {
  id: string;
  name: string;
  sourceType: string;
  location: string;
  servingHouseholds: number;
  qualityStatus: string;
  lastTestDate?: string;
  testResult?: string;
  meetsStandard: boolean;
  note?: string;
}

export const environmentalHealthApi = {
  getSanitationFacilities: (params?: { keyword?: string; facilityType?: string; meetsStandard?: boolean; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: SanitationFacilityDto[]; total: number }>('/environmental-health/sanitation', { params }),
  createFacility: (data: Partial<SanitationFacilityDto>) =>
    client.post('/environmental-health/sanitation', data),
  updateFacility: (id: string, data: Partial<SanitationFacilityDto>) =>
    client.put(`/environmental-health/sanitation/${id}`, data),
  getWaterSources: (params?: { keyword?: string; sourceType?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: WaterSourceDto[]; total: number }>('/environmental-health/water-sources', { params }),
  createWaterSource: (data: Partial<WaterSourceDto>) =>
    client.post('/environmental-health/water-sources', data),
  updateWaterSource: (id: string, data: Partial<WaterSourceDto>) =>
    client.put(`/environmental-health/water-sources/${id}`, data),
  getStatistics: () => client.get('/environmental-health/statistics'),
};
