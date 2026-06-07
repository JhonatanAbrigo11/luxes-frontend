import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NominaProvider } from '../application/context/NominaContext';
import { NominaMockAdapter } from '../infrastructure/adapters/nominaMockAdapter';
import { CredencialesPage } from '../../asistencia/ui/pages/CredencialesPage';
import { RegistrosPage } from '../../asistencia/ui/pages/RegistrosPage';
import { VacacionesPage } from './pages/VacacionesPage';
import { HorasExtrasPage } from './pages/HorasExtrasPage';
import { NominaMesPage } from './pages/NominaMesPage';
import { RolDePagoPage } from './pages/RolDePagoPage';
import EmpleadosFeature from '../../empleados/ui';
import './styles/Nomina.css';

// Instanciar el adaptador por defecto (Mock en memoria para desarrollo local)
const defaultAdapter = new NominaMockAdapter();

/**
 * Módulo de Nómina (Feature Barrel & Router).
 * Se exponen como páginas individuales accesibles desde el Sidebar:
 *   - Registro de Asistencia (Historial de marcaciones)
 *   - Credenciales (Generador de credenciales con código QR)
 *   - Vacaciones (Calendario de vacaciones)
 *   - Horas Extras (Planilla diaria de horas extras)
 *   - Nómina Mes (Tabla de rol quincenal)
 *   - Empleados (Gestión de personal de la empresa)
 */
export default function NominaFeature() {
  return (
    <NominaProvider adapter={defaultAdapter}>
      <Routes>
        <Route index element={<Navigate to="registro-asistencia" replace />} />
        <Route path="registro-asistencia" element={<RegistrosPage />} />
        <Route path="credenciales" element={<CredencialesPage />} />
        <Route path="vacaciones" element={<VacacionesPage />} />
        <Route path="horas-extras" element={<HorasExtrasPage />} />
        <Route path="nomina-mes" element={<NominaMesPage />} />
        <Route path="empleados/*" element={<EmpleadosFeature />} />
        <Route path="rol/:empleadoId" element={<RolDePagoPage />} />
        <Route path="*" element={<Navigate to="registro-asistencia" replace />} />
      </Routes>
    </NominaProvider>
  );
}



