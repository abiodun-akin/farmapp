import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import Navigation from "../components/Navigation";
import NavigationBar from "../components/NavigationBar";
import "./MainLayout.css";

/**
 * MainLayout Component
 * Wraps pages with appropriate navigation based on authentication status
 * Provides consistent layout structure for all user-facing pages
 */
function MainLayout({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const isGuest = !isAuthenticated || !user;
  const location = useLocation();

  // Don't apply background for marketplace page
  const shouldApplyBackground = location.pathname !== "/marketplace";

  return (
    <div
      className={`main-layout ${!shouldApplyBackground ? "marketplace-layout" : ""}`}
      style={
        shouldApplyBackground
          ? {
              backgroundImage:
                "linear-gradient(135deg, rgba(200, 240, 200, 0.5) 0%, rgba(200, 240, 200, 0.6) 50%, rgba(200, 240, 200, 0.7) 100%), url(/images/bg1.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
            }
          : {}
      }
    >
      {isGuest ? <NavigationBar /> : <Navigation />}
      {!isGuest && <EmailVerificationBanner />}
      <main className="main-content">{children}</main>
    </div>
  );
}

export default MainLayout;
