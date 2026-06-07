import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { EmpleadosPage } from './pages/EmpleadosPage';

const EmpleadosFeature = () => (
  <Routes>
    <Route index element={<EmpleadosPage />} />
    <Route path="*" element={<Navigate to="/nomina/empleados" replace />} />
  </Routes>
);

export default EmpleadosFeature;
