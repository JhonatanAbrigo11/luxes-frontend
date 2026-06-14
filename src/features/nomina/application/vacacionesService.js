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

export const getVacaciones = async (anio) => {
  const params = new URLSearchParams({ anio: String(anio) });
  const data = await parseResponse(
    await fetch(`/api/nomina/vacaciones?${params}`, { headers: getHeaders() })
  );

  return data.map((item) => ({
    empleadoId: item.empleadoId,
    año: item.anio,
    diasTomados: item.diasTomados ?? [],
  }));
};

export const saveVacacion = async ({ empleadoId, año, diasTomados }) => {
  const data = await parseResponse(
    await fetch('/api/nomina/vacaciones', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ empleadoId, anio: año, diasTomados }),
    })
  );

  return {
    empleadoId: data.empleadoId,
    año: data.anio,
    diasTomados: data.diasTomados ?? [],
  };
};
