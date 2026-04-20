import { Button, Flex, Heading, Link } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FarmConnectLogo from "./FarmConnectLogo";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 1024px)").matches,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    const handleViewportChange = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="between"
      wrap="wrap"
      py="4"
      px="6"
      style={{
        position: "sticky",
        top: 0,
        overflow: "visible",
        zIndex: 1000,
        borderBottom: "1px solid var(--gray-6)",
        backgroundColor: "rgba(255,255,255,0.98)",
        width: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "60px",
      }}
    >
      <Link asChild href="/" gap="5">
        <RouterLink
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Heading
            size="6"
            weight="bold"
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            <FarmConnectLogo size={isMobile ? 32 : 38} />
          </Heading>
        </RouterLink>
      </Link>
      {isMobile ? (
        <>
          <Button
            variant="ghost"
            size="2"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              border: "1px solid #d9e3db",
              color: "#1f5f3d",
              backgroundColor: "#f7fbf8",
            }}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </Button>

          {isMobileMenuOpen && (
            <Flex
              direction="column"
              gap="3"
              p="4"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "var(--color-background)",
                borderBottom: "1px solid var(--gray-6)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                zIndex: 30,
              }}
            >
              {!isAuthenticated ? (
                <>
                  <Button variant="ghost" onClick={() => handleNavigate("/")}>
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/pricing")}
                  >
                    Pricing
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/signup")}
                  >
                    Create Account
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/login")}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/dashboard")}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/pricing")}
                  >
                    Pricing
                  </Button>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </Flex>
          )}
        </>
      ) : (
        <Flex as="nav" gap="5" align="center" wrap="wrap">
          {!isAuthenticated ? (
            <>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/">Home</RouterLink>
              </Link>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/pricing">Pricing</RouterLink>
              </Link>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/signup">Create Account</RouterLink>
              </Link>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/login">Sign In</RouterLink>
              </Link>
            </>
          ) : (
            <>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/dashboard">Dashboard</RouterLink>
              </Link>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/pricing">Pricing</RouterLink>
              </Link>
              <Button variant="ghost" onClick={handleLogout} size="2">
                Logout
              </Button>
            </>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default NavigationBar;
