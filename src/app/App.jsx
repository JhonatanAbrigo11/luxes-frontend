import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Login } from '../features/auth/infrastructure/ui/Login';
import { LandingPage } from '../features/auth/infrastructure/ui/LandingPage';
import { Layout } from '../shared/ui/components/Layout';
import NominaFeature from '../features/nomina/ui';
import { ColasImpresionPage } from '../features/colas-impresion/ui/ColasImpresionPage';
import { ImpresionesPage } from '../features/impresiones/ui/ImpresionesPage';
import { PrintQueueProvider } from '../features/colas-impresion/context/PrintQueueContext';
import ProyectosFeature from '../features/proyectos/ui/index.jsx';
import { ProyectosProvider } from '../features/proyectos/application/context/ProyectosContext.jsx';
import ProformasFeature from '../features/proformas/ui';
import ClientesFeature from '../features/clientes/ui';
import ProveedoresFeature from '../features/proveedores/ui';
import ContactosFeature from '../features/contactos/ui';
import UsuariosFeature from '../features/usuarios/ui';
import ComprasFeature from '../features/compras/ui';
import VentasFeature from '../features/ventas/ui';
import GastosFeature from '../features/gastos/ui';
import { EncuestaPage } from '../features/proyectos/ui/pages/EncuestaPage.jsx';
import { InstalacionesPage } from '../features/instalaciones/ui/InstalacionesPage.jsx';
import { InventarioPage } from '../features/inventario/ui/InventarioPage.jsx';
import { MaterialesRequestPage } from '../features/instalaciones/ui/MaterialesRequestPage.jsx';
import DashboardPage from '../features/dashboard/ui/pages/DashboardPage.jsx';
import './index.css';

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
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <PrintQueueProvider>
    <ProyectosProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/nomina/*" element={<NominaFeature />} />
          <Route path="/impresiones" element={<ImpresionesPage />} />
          <Route path="/colas-impresion" element={<ColasImpresionPage />} />
          <Route path="/instalaciones" element={<InstalacionesPage />} />
          <Route path="/instalaciones/:id/materiales" element={<MaterialesRequestPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/proyectos/*" element={<ProyectosFeature />} />
          <Route path="/proformas/*" element={<ProformasFeature />} />
          <Route path="/clientes/*" element={<ClientesFeature />} />
          <Route path="/proveedores/*" element={<ProveedoresFeature />} />
          <Route path="/contactos/*" element={<ContactosFeature />} />
          <Route path="/usuarios/*" element={<UsuariosFeature />} />
          <Route path="/compras/*" element={<ComprasFeature />} />
          <Route path="/ventas/*" element={<VentasFeature />} />
          <Route path="/gastos/*" element={<GastosFeature />} />
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ProyectosProvider>
    </PrintQueueProvider>
  );
}

export default App;
