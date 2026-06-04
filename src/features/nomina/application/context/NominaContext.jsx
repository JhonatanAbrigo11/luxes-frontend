// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/application/context/NominaContext.jsx

import React, { createContext, useReducer, useEffect } from 'react';
import { nominaReducer, initialNominaState } from '../store/nominaStore';

export const NominaContext = createContext(null);

/**
 * Proveedor de Contexto de Nómina (Hexagonal).
 * Recibe e inyecta la implementación concreta de infraestructura (adapter).
 */
export const NominaProvider = ({ children, adapter }) => {
  const [state, dispatch] = useReducer(nominaReducer, initialNominaState);

  // Validar que se haya inyectado un adaptador válido
  if (!adapter) {
    console.error("NominaProvider: Se requiere un adapter para interactuar con la infraestructura.");
  }

  return (
    <NominaContext.Provider value={{ state, dispatch, adapter }}>
      {children}
    </NominaContext.Provider>
  );
};
