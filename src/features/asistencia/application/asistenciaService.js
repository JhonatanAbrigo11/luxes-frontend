import { SECUENCIA_MARCACIONES } from '../helpers/asistenciaHelpers';

export const getAsistencias = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem('asistencias_mock');
      resolve(data ? JSON.parse(data) : []);
    }, 500);
  });
};

/**
 * Devuelve la próxima marcación pendiente del empleado en el día actual.
 * null si ya completó las 4 marcaciones.
 */
export const getProximaMarcacion = async (empleadoId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem('asistencias_mock');
      const asistencias = data ? JSON.parse(data) : [];
      const hoy = new Date().toISOString().split('T')[0];

      const registrosHoy = asistencias.filter(a => {
        return a.empleadoId === empleadoId &&
          new Date(a.fechaHora).toISOString().split('T')[0] === hoy;
      });

      const siguiente = SECUENCIA_MARCACIONES[registrosHoy.length] ?? null;
      resolve(siguiente);
    }, 200);
  });
};

export const registrarAsistencia = async ({ empleadoId, ubicacion }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = localStorage.getItem('asistencias_mock');
      const asistencias = data ? JSON.parse(data) : [];
      const hoy = new Date().toISOString().split('T')[0];

      const registrosHoy = asistencias.filter(a => {
        return a.empleadoId === empleadoId &&
          new Date(a.fechaHora).toISOString().split('T')[0] === hoy;
      });

      const siguiente = SECUENCIA_MARCACIONES[registrosHoy.length];

      if (!siguiente) {
        return reject(new Error(`El empleado ${empleadoId} ya completó las 4 marcaciones del día.`));
      }

      const nuevaAsistencia = {
        id: crypto.randomUUID(),
        empleadoId,
        nombreEmpleado: empleadoId,
        tipo: siguiente.tipo,
        label: siguiente.label,
        fechaHora: new Date().toISOString(),
        ubicacion,
      };

      asistencias.push(nuevaAsistencia);
      localStorage.setItem('asistencias_mock', JSON.stringify(asistencias));

      resolve(nuevaAsistencia);
    }, 500);
  });
};
