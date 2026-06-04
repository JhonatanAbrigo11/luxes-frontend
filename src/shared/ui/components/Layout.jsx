import React from 'react';
import { Sidebar } from '../../../features/navigation/infrastructure/ui/Sidebar';
import './Layout.css';

export const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};
