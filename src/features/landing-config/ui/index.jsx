import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingConfigPage } from './pages/LandingConfigPage';

export default function LandingConfigFeature() {
  return (
    <Routes>
      <Route index element={<LandingConfigPage />} />
      <Route path="*" element={<Navigate to="/configuracion/landing" replace />} />
    </Routes>
  );
}
