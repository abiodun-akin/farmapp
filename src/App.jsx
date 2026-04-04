import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import AuthSessionManager from "./components/AuthSessionManager";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import Toast from "./components/Toast";
import "./index.css";
import MainLayout from "./layouts/MainLayout";
import AdminAgentDetail from "./pages/admin/AdminAgentDetail";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminModerationPage from "./pages/admin/AdminModerationPage";
import AdminPaymentAnalytics from "./pages/admin/AdminPaymentAnalytics";
import AdminPaymentDetail from "./pages/admin/AdminPaymentDetail";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminViolations from "./pages/admin/AdminViolations";
import AgentApplicationForm from "./pages/AgentApplicationForm";
import AgentEarnings from "./pages/AgentEarnings";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardRedirect from "./pages/DashboardRedirect";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProfileForm from "./pages/FarmerProfileForm";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import MatchesPage from "./pages/MatchesPage";
import MessagesPage from "./pages/MessagesPage";
import PaymentPage from "./pages/PaymentPage";
import PricingPage from "./pages/PricingPage";
import ProfileTypeSelector from "./pages/ProfileTypeSelector";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import SignUpPage from "./pages/SignUpPage";
import SocialAuthCallbackPage from "./pages/SocialAuthCallbackPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfileForm from "./pages/VendorProfileForm";
import VerifyEmailPage from "./pages/VerifyEmailPage";

function App() {
  return (
    <ErrorBoundary>
      <Theme>
        <Router>
          <Toast />
          <AuthSessionManager />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/social/callback" element={<SocialAuthCallbackPage />} />
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
                  <MainLayout>
                    <ProfileTypeSelector />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/farmer"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <FarmerProfileForm />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/vendor"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <VendorProfileForm />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRedirect />
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
              path="/matches"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <MatchesPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <MatchesPage title="Customers" />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <MessagesPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <SubscriptionPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <SettingsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <AnalyticsPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/apply-agent"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <AgentApplicationForm />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/agent-earnings"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <AgentEarnings />
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
              path="/admin/moderation"
              element={
                <AdminRoute>
                  <AdminModerationPage />
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
              <Route
                path="/admin/agents"
                element={
                  <AdminRoute>
                    <AdminAgents />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/agents/:agentId"
                element={
                  <AdminRoute>
                    <AdminAgentDetail />
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
