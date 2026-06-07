import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProformasPage } from './pages/ProformasPage';

const ProformasFeature = () => (
  <Routes>
    <Route index element={<ProformasPage />} />
    <Route path="*" element={<Navigate to="/proformas" replace />} />
  </Routes>
);

export default ProformasFeature;
