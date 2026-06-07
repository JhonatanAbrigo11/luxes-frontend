// src/features/proyectos/application/hooks/useProyecto.js

import { useProyectosContext } from '../context/ProyectosContext.jsx';
import { ACTIONS } from '../store/proyectosStore.js';
import { validarCamposFase } from '../../domain/use-cases/avanzarFase.js';
import { getFaseConfig } from '../../domain/value-objects/FaseConfig.js';

/**
 * Hook para gestionar un proyecto individual: detalle, avance de fases y edición.
 * 
 * NOTA: La persistencia a localStorage se maneja AUTOMÁTICAMENTE en el
 * ProyectosContext. Este hook solo necesita hacer dispatch al reducer.
 *
 * @param {string} id - ID del proyecto
 */
export function useProyecto(id) {
  const { state, dispatch } = useProyectosContext();

  const proyecto = state.proyectos.find((p) => p.id === id) ?? null;

  function avanzar() {
    if (!proyecto) return;
    dispatch({ type: ACTIONS.AVANZAR_FASE, payload: { id } });
    // Persistence is handled automatically by ProyectosContext auto-save effect
  }

  function retroceder() {
    if (!proyecto) return;
    dispatch({ type: ACTIONS.RETROCEDER_FASE, payload: { id } });
  }

  function updateFaseDatos(faseId, nuevosDatos) {
    if (!proyecto) return;
    const cambios = {
      fases: {
        ...proyecto.fases,
        [faseId]: {
          ...(proyecto.fases?.[faseId] || {}),
          datos: {
            ...(proyecto.fases?.[faseId]?.datos || {}),
            ...nuevosDatos,
          },
        },
      },
    };
    dispatch({ type: ACTIONS.UPDATE_PROYECTO, payload: { id, cambios } });
  }

  function updateProyecto(cambios) {
    if (!proyecto) return;
    dispatch({ type: ACTIONS.UPDATE_PROYECTO, payload: { id, cambios } });
  }

  const validacionFaseActual = proyecto
    ? validarCamposFase(
        getFaseConfig(proyecto.faseActual) || {},
        proyecto.fases?.[proyecto.faseActual] || {}
      )
    : { valido: false, faltantes: [] };

  return {
    proyecto,
    loading: state.loading,
    avanzar,
    retroceder,
    updateFaseDatos,
    updateProyecto,
    validacionFaseActual,
  };
}
