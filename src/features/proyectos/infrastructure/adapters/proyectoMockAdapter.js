// src/features/proyectos/infrastructure/adapters/proyectoMockAdapter.js

import { proyectosMock, empleadosDisponiblesMock } from '../mock/proyectosData.js';

const STORAGE_KEY = 'luxes_proyectos';
const STORAGE_VERSION_KEY = 'luxes_proyectos_version';
const CURRENT_VERSION = '4'; // Bump to force re-seed when data structure changes

const loadFromStorage = () => {
  // Check if mock data structure has been updated — if so, clear and re-seed
  const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
  if (savedVersion !== CURRENT_VERSION) {
    console.info('[Adapter] Data version mismatch, re-seeding mock data.');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing projects from localStorage', e);
    }
  }
  // Store initial mock data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proyectosMock));
  return [...proyectosMock];
};

let proyectosEnMemoria = loadFromStorage();

const saveToStorage = (proyectos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proyectos));
  } catch (e) {
    // Handle QuotaExceededError — likely caused by base64 files
    console.error('Error saving projects to localStorage (quota may be full):', e);

    // Attempt to save without base64 data urls to avoid quota issues
    try {
      const lightProyectos = proyectos.map(p => {
        if (!p.fases) return p;
        const fases = { ...p.fases };
        Object.keys(fases).forEach(key => {
          const fase = fases[key];
          if (fase?.datos?.archivoArte?.url && fase.datos.archivoArte.url.startsWith('data:')) {
            fases[key] = {
              ...fase,
              datos: {
                ...fase.datos,
                archivoArte: {
                  ...fase.datos.archivoArte,
                  url: '[BASE64_TRUNCATED]' // Save metadata only
                }
              }
            };
          }
        });
        return { ...p, fases };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightProyectos));
      console.warn('[Adapter] Saved with truncated base64 data to fit localStorage.');
    } catch (e2) {
      console.error('[Adapter] Even light save failed:', e2);
    }
  }
};

/**
 * Adaptador mock que implementa el ProyectoRepository usando datos en memoria.
 * Ideal para desarrollo y demos sin backend.
 */
export const proyectoMockAdapter = {
  async getAll() {
    proyectosEnMemoria = loadFromStorage();
    return [...proyectosEnMemoria];
  },

  async getById(id) {
    proyectosEnMemoria = loadFromStorage();
    return proyectosEnMemoria.find((p) => p.id === id) ?? null;
  },

  async save(proyecto) {
    proyectosEnMemoria = loadFromStorage();
    proyectosEnMemoria = [...proyectosEnMemoria, proyecto];
    saveToStorage(proyectosEnMemoria);
    return proyecto;
  },

  async update(id, cambios) {
    proyectosEnMemoria = loadFromStorage();
    const exists = proyectosEnMemoria.some((p) => p.id === id);
    if (exists) {
      proyectosEnMemoria = proyectosEnMemoria.map((p) =>
        p.id === id ? { ...p, ...cambios } : p
      );
    } else {
      proyectosEnMemoria = [...proyectosEnMemoria, { id, ...cambios }];
    }
    saveToStorage(proyectosEnMemoria);
    return proyectosEnMemoria.find((p) => p.id === id);
  },

  async delete(id) {
    proyectosEnMemoria = loadFromStorage();
    proyectosEnMemoria = proyectosEnMemoria.filter((p) => p.id !== id);
    saveToStorage(proyectosEnMemoria);
  },

  async getEmpleados() {
    return [...empleadosDisponiblesMock];
  },
};
