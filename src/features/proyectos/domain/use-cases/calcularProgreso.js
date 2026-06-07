// src/features/proyectos/domain/use-cases/calcularProgreso.js

import { PROGRESO_POR_FASE } from '../value-objects/FaseConfig.js';

/**
 * Calcula el progreso porcentual de un proyecto según su fase actual.
 * Función pura — sin side effects.
 *
 * @param {string} faseActual - ID de la fase actual
 * @returns {number} Progreso entre 0 y 100
 */
export function calcularProgreso(faseActual) {
  return PROGRESO_POR_FASE[faseActual] ?? 0;
}
