import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ContactosPage } from './pages/ContactosPage';

export default function ContactosFeature() {
  return (
    <Routes>
      <Route index element={<ContactosPage />} />
      <Route path="*" element={<Navigate to="/contactos" replace />} />
    </Routes>
  );
}
