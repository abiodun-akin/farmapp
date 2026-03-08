import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const DashboardRedirect = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.profileType === "vendor") {
    return <Navigate to="/vendor-dashboard" replace />;
  }

  return <Navigate to="/farmer-dashboard" replace />;
};

export default DashboardRedirect;
