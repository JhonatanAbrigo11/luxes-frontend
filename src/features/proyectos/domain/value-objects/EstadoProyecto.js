// src/features/proyectos/domain/value-objects/EstadoProyecto.js

/**
 * Value object para el estado de un proyecto.
 * No importa nada de fuera del dominio.
 */
export const ESTADOS_PROYECTO = {
  ACTIVO: 'ACTIVO',
  PAUSADO: 'PAUSADO',
  COMPLETADO: 'COMPLETADO',
  CANCELADO: 'CANCELADO',
};

export const ESTADOS_CONFIG = {
  ACTIVO: {
    label: 'Activo',
    color: '#10b981',
    bgColor: '#ecfdf5',
    textColor: '#065f46',
  },
  PAUSADO: {
    label: 'Pausado',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#92400e',
  },
  COMPLETADO: {
    label: 'Completado',
    color: '#059669',
    bgColor: '#d1fae5',
    textColor: '#064e3b',
  },
  CANCELADO: {
    label: 'Cancelado',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#991b1b',
  },
};

export const PRIORIDADES_CONFIG = {
  BAJA: {
    label: 'Baja',
    color: '#64748b',
    bgColor: '#f1f5f9',
    textColor: '#334155',
  },
  MEDIA: {
    label: 'Media',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#1d4ed8',
  },
  ALTA: {
    label: 'Alta',
    color: '#f97316',
    bgColor: '#fff7ed',
    textColor: '#c2410c',
  },
  URGENTE: {
    label: 'Urgente',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#991b1b',
  },
};
