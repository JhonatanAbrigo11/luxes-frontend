const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export async function getLandingImageOverrides() {
  const response = await fetch('/api/landing');
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Error al obtener imágenes del landing');
  }
  return data.data ?? {};
}

export async function uploadLandingImage(section, itemId, file) {
  const formData = new FormData();
  formData.append('section', section);
  formData.append('itemId', itemId);
  formData.append('image', file);

  const response = await fetch('/api/landing/images', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Error al subir la imagen');
  }

  return data.data;
}

export async function resetLandingImage(section, itemId) {
  const response = await fetch(`/api/landing/images/${section}/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Error al restaurar la imagen');
  }

  return data.data;
}
