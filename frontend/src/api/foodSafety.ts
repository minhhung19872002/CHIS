import client from './client';

export interface FoodBusinessDto {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  phoneNumber?: string;
  businessType: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  lastInspectionDate?: string;
  status: number;
  violations: FoodViolationDto[];
}

export interface FoodViolationDto {
  id: string;
  businessId: string;
  violationDate: string;
  description: string;
  severity: string;
  penalty?: string;
  correctiveAction?: string;
  resolvedDate?: string;
}

export interface FoodPoisoningDto {
  id: string;
  incidentDate: string;
  location: string;
  affectedCount: number;
  hospitalizedCount: number;
  deathCount: number;
  suspectedFood: string;
  causativeAgent?: string;
  source?: string;
  status: string;
  reportedBy: string;
}

export const foodSafetyApi = {
  getBusinesses: (params?: { keyword?: string; businessType?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: FoodBusinessDto[]; total: number }>('/food-safety/businesses', { params }),
  createBusiness: (data: Partial<FoodBusinessDto>) =>
    client.post('/food-safety/businesses', data),
  updateBusiness: (id: string, data: Partial<FoodBusinessDto>) =>
    client.put(`/food-safety/businesses/${id}`, data),
  recordViolation: (data: Partial<FoodViolationDto>) =>
    client.post('/food-safety/violations', data),
  getPoisoningIncidents: (params?: { year?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: FoodPoisoningDto[]; total: number }>('/food-safety/poisoning', { params }),
  reportPoisoning: (data: Partial<FoodPoisoningDto>) =>
    client.post('/food-safety/poisoning', data),
  getStatistics: (params?: { year?: number }) =>
    client.get('/food-safety/statistics', { params }),
};
