import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../features/auth/infrastructure/ui/Login';
import { Layout } from '../shared/ui/components/Layout';
import NominaFeature from '../features/nomina/ui';
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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/nomina/*" element={<NominaFeature />} />
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
