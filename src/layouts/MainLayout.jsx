import React from 'react';
import Navigation from '../components/Navigation';
import './MainLayout.css';

/**
 * MainLayout Component
 * Wraps authenticated pages with Navigation component
 * Provides consistent layout structure for all user-facing pages
 */
function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
