// src/features/proyectos/domain/use-cases/agregarMaterialInstalacion.js

/**
 * Agrega un material a la lista de materiales de instalación.
 * Función pura — sin side effects.
 *
 * @param {object} proyecto
 * @param {{ nombre, cantidad, unidad, observacion }} material
 * @returns {object} Nuevo estado del proyecto
 */
export function agregarMaterialInstalacion(proyecto, material) {
  if (!material.nombre || material.nombre.trim() === '') {
    throw new Error('El nombre del material es requerido');
  }

  const faseInstalacion = proyecto.fases?.INSTALACION || {
    completada: false,
    datos: {},
  };
  const materialesActuales = faseInstalacion.datos?.materiales || [];

  return {
    ...proyecto,
    fases: {
      ...proyecto.fases,
      INSTALACION: {
        ...faseInstalacion,
        datos: {
          ...faseInstalacion.datos,
          materiales: [...materialesActuales, material],
        },
      },
    },
  };
}

/**
 * Elimina un material de la lista por índice.
 * Función pura — sin side effects.
 *
 * @param {object} proyecto
 * @param {number} indice
 * @returns {object} Nuevo estado del proyecto
 */
export function eliminarMaterialInstalacion(proyecto, indice) {
  const faseInstalacion = proyecto.fases?.INSTALACION || {
    completada: false,
    datos: {},
  };
  const materialesActuales = faseInstalacion.datos?.materiales || [];

  return {
    ...proyecto,
    fases: {
      ...proyecto.fases,
      INSTALACION: {
        ...faseInstalacion,
        datos: {
          ...faseInstalacion.datos,
          materiales: materialesActuales.filter((_, i) => i !== indice),
        },
      },
    },
  };
}

/**
 * Reemplaza toda la lista de materiales de instalación.
 * Función pura — sin side effects.
 *
 * @param {object} proyecto
 * @param {Array} materiales
 * @returns {object} Nuevo estado del proyecto
 */
export function setMaterialesInstalacion(proyecto, materiales) {
  const faseInstalacion = proyecto.fases?.INSTALACION || {
    completada: false,
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
          materiales,
        },
      },
    },
  };
}
