const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export async function getNotifications() {
  const res = await fetch('/api/notifications', { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener notificaciones');
  return data.data;
}

export async function getUnreadCount() {
  const res = await fetch('/api/notifications/unread-count', { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener conteo');
  return data.data;
}

export async function markAsRead(id) {
  const res = await fetch(`/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al marcar como leída');
  return data.data;
}
