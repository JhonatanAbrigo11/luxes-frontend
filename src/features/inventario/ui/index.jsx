import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { InventarioPage } from './InventarioPage';
import { PrestamosPage } from './PrestamosPage';
import { RecepcionInsumosListPage } from './recepcion/RecepcionInsumosListPage';
import { RecepcionInsumosFormPage } from './recepcion/RecepcionInsumosFormPage';

export default function InventarioFeature() {
  return (
    <Routes>
      <Route index element={<InventarioPage />} />
      <Route path="prestamos" element={<PrestamosPage />} />
      <Route path="recepcion" element={<RecepcionInsumosListPage />} />
      <Route path="recepcion/:ordenId" element={<RecepcionInsumosFormPage />} />
      <Route path="*" element={<Navigate to="/inventario" replace />} />
    </Routes>
  );
}
