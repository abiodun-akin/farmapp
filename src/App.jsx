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
import Toast from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";

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
          </Routes>
        </Router>
      </Theme>
    </ErrorBoundary>
  );
}

export default App;
