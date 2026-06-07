import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { VentasPage } from './pages/VentasPage';

export default function VentasFeature() {
  return (
    <Routes>
      <Route index element={<VentasPage />} />
      <Route path="*" element={<Navigate to="/ventas" replace />} />
    </Routes>
  );
}
