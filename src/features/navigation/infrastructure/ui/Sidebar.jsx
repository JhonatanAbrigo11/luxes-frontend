import React from 'react';
import './Sidebar.css';

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>LUXES 2026</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className="active"><a href="#dashboard">Dashboard</a></li>
          <li><a href="#events">Events</a></li>
          <li><a href="#teams">Teams</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <a href="#logout" className="logout-btn">Logout</a>
      </div>
    </aside>
  );
};
