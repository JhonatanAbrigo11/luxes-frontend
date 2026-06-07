import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from '../features/auth/infrastructure/ui/Login';
import { Layout } from '../shared/ui/components/Layout';
import NominaFeature from '../features/nomina/ui';
import { ColasImpresionPage } from '../features/colas-impresion/ui/ColasImpresionPage';
import { ImpresionesPage } from '../features/impresiones/ui/ImpresionesPage';
import { PrintQueueProvider } from '../features/colas-impresion/context/PrintQueueContext';
import ProyectosFeature from '../features/proyectos/ui/index.jsx';
import { ProyectosProvider } from '../features/proyectos/application/context/ProyectosContext.jsx';
import ProformasFeature from '../features/proformas/ui';
import ClientesFeature from '../features/clientes/ui';
import { EncuestaPage } from '../features/proyectos/ui/pages/EncuestaPage.jsx';
import { InstalacionesPage } from '../features/instalaciones/ui/InstalacionesPage.jsx';
import { InventarioPage } from '../features/inventario/ui/InventarioPage.jsx';
import { MaterialesRequestPage } from '../features/instalaciones/ui/MaterialesRequestPage.jsx';
import './index.css';

function DashboardHome() {
  return (
    <div className="dashboard-content">
      <h1 style={{ marginBottom: '1rem', color: 'var(--color-primary-blue)', fontSize: '2rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-dark-gray)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Welcome to the LUXES 2026 management portal. Select an option from the sidebar to begin.
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          borderTop: '4px solid var(--color-primary-green)'
        }}>
          <h3 style={{ color: 'var(--color-primary-blue)' }}>Upcoming Events</h3>
          <p style={{ marginTop: '0.75rem', color: 'var(--color-dark-gray)' }}>No events scheduled for this week.</p>
        </div>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          borderTop: '4px solid var(--color-accent-red)'
        }}>
          <h3 style={{ color: 'var(--color-primary-blue)' }}>System Status</h3>
          <p style={{ marginTop: '0.75rem', color: 'var(--color-dark-gray)' }}>All systems operational.</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const location = useLocation();

  // Rutas públicas que no requieren autenticación
  if (location.pathname.startsWith('/encuesta/')) {
    return (
      <Routes>
        <Route path="/encuesta/:id" element={<EncuestaPage />} />
      </Routes>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <PrintQueueProvider>
    <ProyectosProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/nomina/*" element={<NominaFeature />} />
          <Route path="/impresiones" element={<ImpresionesPage />} />
          <Route path="/colas-impresion" element={<ColasImpresionPage />} />
          <Route path="/instalaciones" element={<InstalacionesPage />} />
          <Route path="/instalaciones/:id/materiales" element={<MaterialesRequestPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/proyectos/*" element={<ProyectosFeature />} />
          <Route path="/proformas/*" element={<ProformasFeature />} />
          <Route path="/clientes/*" element={<ClientesFeature />} />
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ProyectosProvider>
    </PrintQueueProvider>
  );
}

export default App;
