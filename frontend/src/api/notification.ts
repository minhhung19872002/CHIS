import client from './client';

export interface NotificationDto {
  id: string;
  title: string;
  content: string;
  type: string;
  module?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export const notificationApi = {
  getMyNotifications: (params?: { pageIndex?: number; pageSize?: number }) =>
    client.get<{ items: NotificationDto[]; total: number }>('/notifications/my', { params }),
  getUnreadCount: () => client.get<{ count: number }>('/notifications/unread-count'),
  markAsRead: (id: string) => client.put(`/notifications/${id}/read`),
  markAllAsRead: () => client.put('/notifications/read-all'),
};
