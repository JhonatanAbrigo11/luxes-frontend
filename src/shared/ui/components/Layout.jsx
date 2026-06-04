import React, { useState } from 'react';
import { Sidebar } from '../../../features/navigation/infrastructure/ui/Sidebar';
import './Layout.css';

export const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`layout-container ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar 
        isCollapsed={isCollapsed} 
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      />
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};
