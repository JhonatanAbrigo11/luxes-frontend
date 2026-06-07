import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GastosPage } from './pages/GastosPage';

export default function GastosFeature() {
  return (
    <Routes>
      <Route index element={<GastosPage />} />
      <Route path="*" element={<Navigate to="/gastos" replace />} />
    </Routes>
  );
}
