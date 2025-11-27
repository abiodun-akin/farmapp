import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import PricingPage from "./pages/PricingPage";

function App() {
  return (
    <Theme>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </Router>
    </Theme>
  );
}

export default App;
