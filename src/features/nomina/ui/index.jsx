// c:/Users/Morqu/OneDrive/Documentos/JAIMS/Luxes/luxes-frontend/src/features/nomina/ui/index.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { NominaProvider } from '../application/context/NominaContext';
import { NominaMockAdapter } from '../infrastructure/adapters/nominaMockAdapter';
import { NominaPage } from './pages/NominaPage';
import { HorasExtrasPage } from './pages/HorasExtrasPage';
import { RolDePagoPage } from './pages/RolDePagoPage';
import './styles/Nomina.css';

// Instanciar el adaptador por defecto (Mock en memoria para desarrollo local)
const defaultAdapter = new NominaMockAdapter();

/**
 * Módulo de Nómina (Feature Barrel & Router).
 * Es la única compuerta pública del módulo Nómina hacia el resto de la aplicación.
 * Configura las sub-rutas y provee el contexto inyectando el adaptador.
 */
export default function NominaFeature() {
  return (
    <NominaProvider adapter={defaultAdapter}>
      <Routes>
        <Route index element={<NominaPage />} />
        <Route path="horas-extras" element={<HorasExtrasPage />} />
        <Route path="rol/:empleadoId" element={<RolDePagoPage />} />
      </Routes>
    </NominaProvider>
  );
}
