import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { systemApi } from '../system'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('systemApi', () => {
  it('getCatalog sends GET /system/catalog/:category with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'test', pageIndex: 0, pageSize: 20 }
    await systemApi.getCatalog('icd', params)
    expect(client.get).toHaveBeenCalledWith('/system/catalog/icd', { params })
  })

  it('getCatalog sends GET /system/catalog/:category without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await systemApi.getCatalog('icd')
    expect(client.get).toHaveBeenCalledWith('/system/catalog/icd', { params: undefined })
  })

  it('createCatalogItem sends POST /system/catalog/:category', async () => {
    const data = { code: 'ICD001', name: 'Test ICD', sortOrder: 1, isActive: true }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'c1' } })
    await systemApi.createCatalogItem('icd', data)
    expect(client.post).toHaveBeenCalledWith('/system/catalog/icd', data)
  })

  it('updateCatalogItem sends PUT /system/catalog/:category/:id', async () => {
    const data = { name: 'Updated ICD' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await systemApi.updateCatalogItem('icd', 'c1', data)
    expect(client.put).toHaveBeenCalledWith('/system/catalog/icd/c1', data)
  })

  it('deleteCatalogItem sends DELETE /system/catalog/:category/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue({ data: undefined })
    await systemApi.deleteCatalogItem('icd', 'c1')
    expect(client.delete).toHaveBeenCalledWith('/system/catalog/icd/c1')
  })

  it('getUsers sends GET /system/users with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { keyword: 'admin', roleId: 'r1', pageIndex: 0, pageSize: 20 }
    await systemApi.getUsers(params)
    expect(client.get).toHaveBeenCalledWith('/system/users', { params })
  })

  it('getUsers sends GET /system/users without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await systemApi.getUsers()
    expect(client.get).toHaveBeenCalledWith('/system/users', { params: undefined })
  })

  it('createUser sends POST /system/users', async () => {
    const data = { username: 'newuser', fullName: 'New User', password: 'Pass@123', roles: ['doctor'] }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'u1' } })
    await systemApi.createUser(data)
    expect(client.post).toHaveBeenCalledWith('/system/users', data)
  })

  it('updateUser sends PUT /system/users/:id', async () => {
    const data = { fullName: 'Updated User' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await systemApi.updateUser('u1', data)
    expect(client.put).toHaveBeenCalledWith('/system/users/u1', data)
  })

  it('resetPassword sends POST /system/users/:id/reset-password', async () => {
    vi.mocked(client.post).mockResolvedValue({ data: undefined })
    await systemApi.resetPassword('u1')
    expect(client.post).toHaveBeenCalledWith('/system/users/u1/reset-password')
  })

  it('getRoles sends GET /system/roles', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await systemApi.getRoles()
    expect(client.get).toHaveBeenCalledWith('/system/roles')
  })

  it('createRole sends POST /system/roles', async () => {
    const data = { name: 'nurse', description: 'Nurse role', permissions: ['read:patient'] }
    vi.mocked(client.post).mockResolvedValue({ data: { id: 'r1' } })
    await systemApi.createRole(data)
    expect(client.post).toHaveBeenCalledWith('/system/roles', data)
  })

  it('updateRole sends PUT /system/roles/:id', async () => {
    const data = { name: 'Updated Role' }
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await systemApi.updateRole('r1', data)
    expect(client.put).toHaveBeenCalledWith('/system/roles/r1', data)
  })

  it('getPermissions sends GET /system/permissions', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await systemApi.getPermissions()
    expect(client.get).toHaveBeenCalledWith('/system/permissions')
  })

  it('getConfigs sends GET /system/configs with category', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await systemApi.getConfigs('general')
    expect(client.get).toHaveBeenCalledWith('/system/configs', { params: { category: 'general' } })
  })

  it('getConfigs sends GET /system/configs without category', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: [] })
    await systemApi.getConfigs()
    expect(client.get).toHaveBeenCalledWith('/system/configs', { params: { category: undefined } })
  })

  it('updateConfig sends PUT /system/configs', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await systemApi.updateConfig('facility.name', 'TYT Thuong Tin')
    expect(client.put).toHaveBeenCalledWith('/system/configs', { key: 'facility.name', value: 'TYT Thuong Tin' })
  })

  it('getAuditLogs sends GET /system/audit-logs with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { userId: 'u1', action: 'login', module: 'auth', fromDate: '2024-01-01', toDate: '2024-01-31', pageIndex: 0, pageSize: 20 }
    await systemApi.getAuditLogs(params)
    expect(client.get).toHaveBeenCalledWith('/system/audit-logs', { params })
  })

  it('getAuditLogs sends GET /system/audit-logs without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await systemApi.getAuditLogs()
    expect(client.get).toHaveBeenCalledWith('/system/audit-logs', { params: undefined })
  })
})
