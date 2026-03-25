import React from 'react';
import Navigation from '../components/Navigation';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import './MainLayout.css';

/**
 * MainLayout Component
 * Wraps authenticated pages with Navigation component
 * Provides consistent layout structure for all user-facing pages
 */
function MainLayout({ children }) {
  return (
    <div
      className="main-layout"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(200, 240, 200, 0.5) 0%, rgba(200, 240, 200, 0.6) 50%, rgba(200, 240, 200, 0.7) 100%), url(/images/bg1.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Navigation />
      <EmailVerificationBanner />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
