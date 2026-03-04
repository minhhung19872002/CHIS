import client from './client';

export interface HouseholdDto {
  id: string;
  householdCode: string;
  headName: string;
  address: string;
  wardId: string;
  wardName: string;
  villageGroup?: string;
  memberCount: number;
  phone?: string;
  createdDate: string;
  members: HouseholdMemberDto[];
}

export interface HouseholdMemberDto {
  id: string;
  patientId?: string;
  fullName: string;
  dateOfBirth: string;
  gender: number;
  relationship: string;
  idNumber?: string;
  insuranceNumber?: string;
  isHead: boolean;
  occupation?: string;
  ethnicGroup?: string;
}

export interface BirthCertificateDto {
  id: string;
  childName: string;
  dateOfBirth: string;
  gender: number;
  birthWeight?: number;
  birthPlace: string;
  motherName: string;
  fatherName?: string;
  householdId?: string;
  registrationDate: string;
  certificateNumber?: string;
}

export interface DeathCertificateDto {
  id: string;
  deceasedName: string;
  dateOfDeath: string;
  causeOfDeath: string;
  icdCode?: string;
  age: number;
  gender: number;
  address: string;
  deathPlace: string;
  certificateNumber?: string;
  reporterName: string;
}

export const populationApi = {
  searchHouseholds: (params: { keyword?: string; wardId?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: HouseholdDto[]; total: number }>('/population/households', { params }),
  getHousehold: (id: string) => client.get<HouseholdDto>(`/population/households/${id}`),
  createHousehold: (data: Partial<HouseholdDto>) =>
    client.post<HouseholdDto>('/population/households', data),
  updateHousehold: (id: string, data: Partial<HouseholdDto>) =>
    client.put(`/population/households/${id}`, data),
  addMember: (householdId: string, data: Partial<HouseholdMemberDto>) =>
    client.post(`/population/households/${householdId}/members`, data),
  getBirthCertificates: (params?: { year?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: BirthCertificateDto[]; total: number }>('/population/births', { params }),
  createBirth: (data: Partial<BirthCertificateDto>) =>
    client.post('/population/births', data),
  getDeathCertificates: (params?: { year?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: DeathCertificateDto[]; total: number }>('/population/deaths', { params }),
  createDeath: (data: Partial<DeathCertificateDto>) =>
    client.post('/population/deaths', data),
  getElderlyList: (params?: { ageFrom?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: HouseholdMemberDto[]; total: number }>('/population/elderly', { params }),
  getDemographicStats: () => client.get('/population/statistics'),
};
