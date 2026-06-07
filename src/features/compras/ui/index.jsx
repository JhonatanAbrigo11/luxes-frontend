import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ComprasPage } from './pages/ComprasPage';

export default function ComprasFeature() {
  return (
    <Routes>
      <Route index element={<ComprasPage />} />
      <Route path="*" element={<Navigate to="/compras" replace />} />
    </Routes>
  );
}
