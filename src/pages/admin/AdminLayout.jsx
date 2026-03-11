import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = ({ title, children }) => {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-mark">FC</div>
          <div>
            <div className="brand-title">FarmConnect</div>
            <div className="brand-subtitle">Admin Console</div>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-link">
            Overview
          </NavLink>
          <NavLink to="/admin/users" className="admin-link">
            Users
          </NavLink>
          <NavLink to="/admin/violations" className="admin-link">
            Violations
          </NavLink>
          <NavLink to="/admin/messages" className="admin-link">
            Flagged Messages
          </NavLink>
          <NavLink to="/admin/subscriptions" className="admin-link">
            Subscriptions
          </NavLink>
          <div className="admin-nav-divider" />
          <NavLink to="/admin/payments" className="admin-link">
            Payments
          </NavLink>
          <NavLink to="/admin/payments-analytics" className="admin-link">
            Payment Analytics
          </NavLink>
          <div className="admin-nav-divider" />
          <NavLink to="/admin/agents" className="admin-link">
            Agents
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1>{title}</h1>
          <div className="admin-header-accent" />
        </header>
        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
};

export default AdminLayout;
