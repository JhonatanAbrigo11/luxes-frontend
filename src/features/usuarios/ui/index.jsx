import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UsuariosPage } from './pages/UsuariosPage';

export default function UsuariosFeature() {
  return (
    <Routes>
      <Route index element={<UsuariosPage />} />
      <Route path="*" element={<Navigate to="/usuarios" replace />} />
    </Routes>
  );
}
