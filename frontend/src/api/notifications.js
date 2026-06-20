import api from './axios';

export async function getNotifications() {
  const { data } = await api.get('/notifications');
  return data.notifications;
}

export async function markNotificationRead(id) {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data.notification;
}

export async function markAllNotificationsRead() {
  const { data } = await api.put('/notifications/read-all');
  return data;
}
