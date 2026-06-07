// src/features/proyectos/application/context/ProyectosContext.jsx

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { proyectosReducer, initialState, ACTIONS } from '../store/proyectosStore.js';
import { proyectoMockAdapter } from '../../infrastructure/adapters/proyectoMockAdapter.js';

const ProyectosContext = createContext(null);

/**
 * Proveedor del contexto de Proyectos.
 * Inyecta el adaptador activo — cambiar `adapter` para usar el API real.
 * 
 * IMPORTANTE: La persistencia se realiza automáticamente cada vez que
 * el state cambia, usando un efecto. Esto elimina problemas de stale
 * closures y duplicación de lógica de persistencia en los hooks.
 */
export const ProyectosProvider = ({ children, adapter = proyectoMockAdapter }) => {
  const [state, dispatch] = useReducer(proyectosReducer, initialState);
  const isInitialLoad = useRef(true);
  const lastSavedRef = useRef(null);

  // Carga inicial de proyectos
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    adapter
      .getAll()
      .then((proyectos) => {
        dispatch({ type: ACTIONS.SET_PROYECTOS, payload: proyectos });
        // Mark initial load complete after state is set
        // Use setTimeout to skip the first auto-save triggered by SET_PROYECTOS
        setTimeout(() => { isInitialLoad.current = false; }, 0);
      })
      .catch((err) => dispatch({ type: ACTIONS.SET_ERROR, payload: err.message }));
  }, [adapter]);

  // Carga de Inventario y Ordenes de Compra
  useEffect(() => {
    // 1. Inventario
    const storedInventario = localStorage.getItem('luxes_inventario');
    if (storedInventario) {
      try {
        dispatch({ type: ACTIONS.SET_INVENTARIO, payload: JSON.parse(storedInventario) });
      } catch (e) {
        console.error('Error parsing inventario from localStorage', e);
      }
    } else {
      const INVENTARIO_SEED = [
        { id: 'inv-1', nombre: 'Acrílico Translúcido 3mm', sku: 'ACR-3MM-BLANCO', categoria: 'Acrílicos', stock: 15, unidad: 'plancha', precioUnitario: 35.00 },
        { id: 'inv-2', nombre: 'Tira LED RGB 12V', sku: 'LED-RGB-12V', categoria: 'Iluminación', stock: 8, unidad: 'rollo (5m)', precioUnitario: 12.50 },
        { id: 'inv-3', nombre: 'Fuente de Poder 12V 30A', sku: 'PWR-12V-30A', categoria: 'Iluminación', stock: 3, unidad: 'unidad', precioUnitario: 18.00 },
        { id: 'inv-4', nombre: 'Vinilo Autoadhesivo Blanco Brillo', sku: 'VIN-AUTO-BLANCO', categoria: 'Vinilos', stock: 50, unidad: 'metro', precioUnitario: 4.50 },
        { id: 'inv-5', nombre: 'Tubo de Aluminio 2x1 pulgada', sku: 'ALU-TUBO-2X1', categoria: 'Estructuras', stock: 12, unidad: 'barra (6m)', precioUnitario: 22.00 },
        { id: 'inv-6', nombre: 'Electrodo para Soldar 6011', sku: 'SLD-ELEC-6011', categoria: 'Herramientas/Consumibles', stock: 100, unidad: 'unidad', precioUnitario: 0.15 },
        { id: 'inv-7', nombre: 'Perno Expansivo 3/8 x 3', sku: 'PRN-EXP-38X3', categoria: 'Tornillería', stock: 4, unidad: 'unidad', precioUnitario: 1.20 },
      ];
      dispatch({ type: ACTIONS.SET_INVENTARIO, payload: INVENTARIO_SEED });
      localStorage.setItem('luxes_inventario', JSON.stringify(INVENTARIO_SEED));
    }

    // 2. Ordenes de compra
    const storedOrdenes = localStorage.getItem('luxes_ordenes_compra');
    if (storedOrdenes) {
      try {
        dispatch({ type: ACTIONS.SET_ORDENES_COMPRA, payload: JSON.parse(storedOrdenes) });
      } catch (e) {
        console.error('Error parsing ordenesCompra from localStorage', e);
      }
    } else {
      dispatch({ type: ACTIONS.SET_ORDENES_COMPRA, payload: [] });
      localStorage.setItem('luxes_ordenes_compra', JSON.stringify([]));
    }
  }, []);

  // Auto-persist Inventario
  useEffect(() => {
    if (state.inventario && state.inventario.length > 0) {
      localStorage.setItem('luxes_inventario', JSON.stringify(state.inventario));
    }
  }, [state.inventario]);

  // Auto-persist Ordenes de Compra
  useEffect(() => {
    if (state.ordenesCompra) {
      localStorage.setItem('luxes_ordenes_compra', JSON.stringify(state.ordenesCompra));
    }
  }, [state.ordenesCompra]);

  // Auto-persist: every time state.proyectos changes, save ALL to localStorage
  useEffect(() => {
    // Skip the initial load (data comes FROM storage, no need to save back)
    if (isInitialLoad.current) return;
    if (!state.proyectos || state.proyectos.length === 0) return;

    // Serialize to compare — avoid redundant writes
    const serialized = JSON.stringify(state.proyectos);
    if (serialized === lastSavedRef.current) return;
    lastSavedRef.current = serialized;

    // Save all projects to localStorage
    try {
      const STORAGE_KEY = 'luxes_proyectos';
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.error('[ProyectosContext] Error auto-saving to localStorage:', e);
      // Fallback: strip base64 data URLs to save space
      try {
        const STORAGE_KEY = 'luxes_proyectos';
        const lightProyectos = state.proyectos.map(p => {
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
                    url: '[BASE64_TRUNCATED]'
                  }
                }
              };
            }
          });
          return { ...p, fases };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightProyectos));
        console.warn('[ProyectosContext] Saved with truncated base64.');
      } catch (e2) {
        console.error('[ProyectosContext] Even light save failed:', e2);
      }
    }
  }, [state.proyectos]);

  // Función reutilizable para recargar proyectos desde el adaptador
  const reloadProyectos = useCallback(() => {
    adapter
      .getAll()
      .then((proyectos) => dispatch({ type: ACTIONS.SET_PROYECTOS, payload: proyectos }))
      .catch((err) => console.error('[ProyectosContext] Error reloading projects:', err));
  }, [adapter]);

  // Sincronización entre pestañas: storage event + focus/visibility
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'luxes_proyectos') {
        isInitialLoad.current = true;
        reloadProyectos();
        setTimeout(() => { isInitialLoad.current = false; }, 100);
      }
    };

    const handleFocus = () => {
      isInitialLoad.current = true;
      reloadProyectos();
      setTimeout(() => { isInitialLoad.current = false; }, 100);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isInitialLoad.current = true;
        reloadProyectos();
        setTimeout(() => { isInitialLoad.current = false; }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadProyectos]);

  return (
    <ProyectosContext.Provider value={{ state, dispatch, adapter, reloadProyectos }}>
      {children}
    </ProyectosContext.Provider>
  );
};

/**
 * Hook para consumir el contexto de Proyectos.
 * Lanza error si se usa fuera del Provider.
 */
export const useProyectosContext = () => {
  const ctx = useContext(ProyectosContext);
  if (!ctx) throw new Error('useProyectosContext debe usarse dentro de ProyectosProvider');
  return ctx;
};
