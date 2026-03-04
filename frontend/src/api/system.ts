import client from './client';

export interface CatalogItemDto {
  id: string;
  code: string;
  name: string;
  category: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  extra?: Record<string, unknown>;
}

export interface UserDto {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  roles: string[];
  facilityId?: string;
  isActive: boolean;
  lastLogin?: string;
}

export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface SystemConfigDto {
  key: string;
  value: string;
  description?: string;
  category: string;
}

export interface AuditLogDto {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
  module?: string;
}

export const systemApi = {
  getCatalog: (category: string, params?: { keyword?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: CatalogItemDto[]; total: number }>(`/system/catalog/${category}`, { params }),
  createCatalogItem: (category: string, data: Partial<CatalogItemDto>) =>
    client.post(`/system/catalog/${category}`, data),
  updateCatalogItem: (category: string, id: string, data: Partial<CatalogItemDto>) =>
    client.put(`/system/catalog/${category}/${id}`, data),
  deleteCatalogItem: (category: string, id: string) =>
    client.delete(`/system/catalog/${category}/${id}`),
  getUsers: (params?: { keyword?: string; roleId?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: UserDto[]; total: number }>('/system/users', { params }),
  createUser: (data: Partial<UserDto> & { password: string }) =>
    client.post('/system/users', data),
  updateUser: (id: string, data: Partial<UserDto>) =>
    client.put(`/system/users/${id}`, data),
  resetPassword: (id: string) => client.post(`/system/users/${id}/reset-password`),
  getRoles: () => client.get<RoleDto[]>('/system/roles'),
  createRole: (data: Partial<RoleDto>) => client.post('/system/roles', data),
  updateRole: (id: string, data: Partial<RoleDto>) =>
    client.put(`/system/roles/${id}`, data),
  getPermissions: () => client.get<string[]>('/system/permissions'),
  getConfigs: (category?: string) =>
    client.get<SystemConfigDto[]>('/system/configs', { params: { category } }),
  updateConfig: (key: string, value: string) =>
    client.put('/system/configs', { key, value }),
  getAuditLogs: (params?: { userId?: string; action?: string; module?: string; fromDate?: string; toDate?: string; pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: AuditLogDto[]; total: number }>('/system/audit-logs', { params }),
};
