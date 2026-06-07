import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProveedoresPage } from './pages/ProveedoresPage';

export default function ProveedoresFeature() {
  return (
    <Routes>
      <Route index element={<ProveedoresPage />} />
      <Route path="*" element={<Navigate to="/proveedores" replace />} />
    </Routes>
  );
}
