import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClientesPage } from './pages/ClientesPage';

export default function ClientesFeature() {
  return (
    <Routes>
      <Route index element={<ClientesPage />} />
      <Route path="*" element={<Navigate to="/clientes" replace />} />
    </Routes>
  );
}
