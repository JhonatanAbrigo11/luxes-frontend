// src/features/proyectos/domain/use-cases/asignarPersonalInstalacion.js

/**
 * Asigna o reemplaza el personal de la fase INSTALACION de un proyecto.
 * Función pura — sin side effects.
 *
 * @param {object} proyecto
 * @param {Array<{empleadoId, nombre, rol}>} personal
 * @returns {object} Nuevo estado del proyecto con personal actualizado
 */
export function asignarPersonalInstalacion(proyecto, personal) {
  if (!Array.isArray(personal)) {
    throw new Error('personal debe ser un array');
  }

  const faseInstalacion = proyecto.fases?.INSTALACION || {
    completada: false,
    fechaCompletada: null,
    datos: {},
  };

  return {
    ...proyecto,
    fases: {
      ...proyecto.fases,
      INSTALACION: {
        ...faseInstalacion,
        datos: {
          ...faseInstalacion.datos,
          personalAsignado: personal,
        },
      },
    },
  };
}

/**
 * Quita un empleado del personal de instalación.
 * Función pura — sin side effects.
 *
 * @param {object} proyecto
 * @param {number|string} empleadoId
 * @returns {object} Nuevo estado del proyecto
 */
export function quitarPersonalInstalacion(proyecto, empleadoId) {
  const faseInstalacion = proyecto.fases?.INSTALACION || {
    completada: false,
    datos: {},
  };
  const personalActual = faseInstalacion.datos?.personalAsignado || [];

  return {
    ...proyecto,
    fases: {
      ...proyecto.fases,
      INSTALACION: {
        ...faseInstalacion,
        datos: {
          ...faseInstalacion.datos,
          personalAsignado: personalActual.filter(
            (p) => p.empleadoId !== empleadoId
          ),
        },
      },
    },
  };
}
