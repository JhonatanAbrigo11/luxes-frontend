import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardAsistencias } from './pages/DashboardAsistencias';
import { EscanearQR } from './pages/EscanearQR';
import { CredencialesPage } from './pages/CredencialesPage';
import { RegistrosPage } from './pages/RegistrosPage';

export default function AsistenciaFeature() {
  return (
    <Routes>
      <Route path="/" element={<CredencialesPage />} />
      <Route path="/credenciales" element={<CredencialesPage />} />
      <Route path="/registros" element={<RegistrosPage />} />
      <Route path="/escanear" element={<EscanearQR />} />
      <Route path="*" element={<Navigate to="/asistencias/credenciales" replace />} />
    </Routes>
  );
}
