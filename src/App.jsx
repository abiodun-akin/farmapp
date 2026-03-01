import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PricingPage from "./pages/PricingPage";
import PaymentPage from "./pages/PaymentPage";
import ProfileTypeSelector from "./pages/ProfileTypeSelector";
import FarmerProfileForm from "./pages/FarmerProfileForm";
import VendorProfileForm from "./pages/VendorProfileForm";
import FarmerDashboard from "./pages/FarmerDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminViolations from "./pages/admin/AdminViolations";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPaymentDetail from "./pages/admin/AdminPaymentDetail";
import AdminPaymentAnalytics from "./pages/admin/AdminPaymentAnalytics";
import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <ErrorBoundary>
      <Theme>
        <Router>
          <Toast />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route
              path="/payment"
              element={
                <PrivateRoute>
                  <PaymentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfileTypeSelector />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/farmer"
              element={
                <PrivateRoute>
                  <FarmerProfileForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/vendor"
              element={
                <PrivateRoute>
                  <VendorProfileForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/farmer-dashboard"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <FarmerDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/vendor-dashboard"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <VendorDashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users/:userId"
              element={
                <AdminRoute>
                  <AdminUserDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/violations"
              element={
                <AdminRoute>
                  <AdminViolations />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <AdminRoute>
                  <AdminMessages />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <AdminRoute>
                  <AdminSubscriptions />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments/:paymentId"
              element={
                <AdminRoute>
                  <AdminPaymentDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments-analytics"
              element={
                <AdminRoute>
                  <AdminPaymentAnalytics />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
      </Theme>
    </ErrorBoundary>
  );
}

export default App;
