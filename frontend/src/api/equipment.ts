import client from './client';

export interface EquipmentDto {
  id: string;
  code: string;
  name: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  location?: string;
  status: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  responsiblePerson?: string;
  note?: string;
}

export interface EquipmentTransferDto {
  id: string;
  equipmentId: string;
  equipmentName: string;
  fromLocation: string;
  toLocation: string;
  transferDate: string;
  reason: string;
  approvedBy?: string;
  status: number;
}

export interface EquipmentDisposalDto {
  id: string;
  equipmentId: string;
  equipmentName: string;
  disposalDate: string;
  reason: string;
  method: string;
  approvedBy?: string;
  residualValue?: number;
}

export const equipmentApi = {
  getList: (params?: { keyword?: string; category?: string; status?: number; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: EquipmentDto[]; total: number }>('/equipment', { params }),
  getById: (id: string) => client.get<EquipmentDto>(`/equipment/${id}`),
  create: (data: Partial<EquipmentDto>) => client.post('/equipment', data),
  update: (id: string, data: Partial<EquipmentDto>) => client.put(`/equipment/${id}`, data),
  transfer: (data: Partial<EquipmentTransferDto>) => client.post('/equipment/transfers', data),
  getTransfers: (params?: { pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: EquipmentTransferDto[]; total: number }>('/equipment/transfers', { params }),
  dispose: (data: Partial<EquipmentDisposalDto>) => client.post('/equipment/disposals', data),
  getDisposals: (params?: { pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: EquipmentDisposalDto[]; total: number }>('/equipment/disposals', { params }),
  getTrackingBook: (params?: { year?: number }) =>
    client.get('/equipment/tracking-book', { params }),
  getStatistics: () => client.get('/equipment/statistics'),
};
