const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const parseResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || 'Error en la operación');
  }
  return data.data;
};

export const getAsistencias = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.fechaInicio) params.set('fechaInicio', filters.fechaInicio);
  if (filters.fechaFin) params.set('fechaFin', filters.fechaFin);
  if (filters.empleadoId) params.set('empleadoId', filters.empleadoId);

  const query = params.toString();
  return parseResponse(
    await fetch(`/api/nomina/asistencias${query ? `?${query}` : ''}`, { headers: getHeaders() })
  );
};

export const getProximaMarcacion = async (empleadoId) => {
  return parseResponse(
    await fetch(`/api/nomina/asistencias/proxima-marcacion/${empleadoId}`, { headers: getHeaders() })
  );
};

export const registrarAsistencia = async ({ empleadoId, ubicacion }) => {
  return parseResponse(
    await fetch('/api/nomina/asistencias', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ empleadoId, ubicacion }),
    })
  );
};
