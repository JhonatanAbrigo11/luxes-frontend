const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// ── Materiales ─────────────────────────────────────────────────────────────

export async function getMateriales(options = {}) {
  const params = new URLSearchParams();
  if (typeof options === 'string') {
    params.append('tipo', options);
  } else {
    const { tipo, page, limit, search, categoria } = options;
    if (tipo) params.append('tipo', tipo);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (categoria) params.append('categoria', categoria);
  }

  const url = `/api/inventario?${params.toString()}`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener materiales');
  return data.data;
}

export async function getInventarioStats() {
  const res = await fetch('/api/inventario/stats', { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener estadísticas');
  return data.data;
}

export async function getUnidadesMedida() {
  const res = await fetch('/api/inventario/unidades-medida', { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener unidades de medida');
  return data.data;
}

export async function createMaterial(body) {
  const res = await fetch('/api/inventario', {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al crear material');
  return data.data;
}

export async function updateMaterial(id, body) {
  const res = await fetch(`/api/inventario/${id}`, {
    method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al actualizar material');
  return data.data;
}

export async function deleteMaterial(id) {
  const res = await fetch(`/api/inventario/${id}`, {
    method: 'DELETE', headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al eliminar material');
  return data.data;
}

// ── Movimientos ─────────────────────────────────────────────────────────────

export async function getMovimientos(materialId) {
  const url = materialId ? `/api/inventario/movimientos?materialId=${materialId}` : '/api/inventario/movimientos';
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener movimientos');
  return data.data;
}

export async function registrarMovimiento(materialId, body) {
  const res = await fetch(`/api/inventario/${materialId}/movimiento`, {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al registrar movimiento');
  return data.data;
}

// ── Préstamos ───────────────────────────────────────────────────────────────

export async function getPrestamos(estado) {
  const url = estado ? `/api/inventario/prestamos?estado=${estado}` : '/api/inventario/prestamos';
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al obtener préstamos');
  return data.data;
}

export async function registrarPrestamo(body) {
  const res = await fetch('/api/inventario/prestamos', {
    method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al registrar préstamo');
  return data.data;
}

export async function devolverPrestamo(id) {
  const res = await fetch(`/api/inventario/prestamos/${id}/retorno`, {
    method: 'PUT', headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error?.message || 'Error al registrar devolución');
  return data.data;
}
