import { describe, it, expect, vi, beforeEach } from 'vitest'
import client from '../client'
import { notificationApi } from '../notification'

vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('notificationApi', () => {
  it('getMyNotifications sends GET /notifications/my with params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    const params = { pageIndex: 0, pageSize: 20 }
    await notificationApi.getMyNotifications(params)
    expect(client.get).toHaveBeenCalledWith('/notifications/my', { params })
  })

  it('getMyNotifications sends GET /notifications/my without params', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { items: [], total: 0 } })
    await notificationApi.getMyNotifications()
    expect(client.get).toHaveBeenCalledWith('/notifications/my', { params: undefined })
  })

  it('getUnreadCount sends GET /notifications/unread-count', async () => {
    vi.mocked(client.get).mockResolvedValue({ data: { count: 5 } })
    const result = await notificationApi.getUnreadCount()
    expect(client.get).toHaveBeenCalledWith('/notifications/unread-count')
    expect(result.data.count).toBe(5)
  })

  it('markAsRead sends PUT /notifications/:id/read', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await notificationApi.markAsRead('n1')
    expect(client.put).toHaveBeenCalledWith('/notifications/n1/read')
  })

  it('markAllAsRead sends PUT /notifications/read-all', async () => {
    vi.mocked(client.put).mockResolvedValue({ data: undefined })
    await notificationApi.markAllAsRead()
    expect(client.put).toHaveBeenCalledWith('/notifications/read-all')
  })
})
