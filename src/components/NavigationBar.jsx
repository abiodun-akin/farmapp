import { Button, Flex, Heading, Link } from "@radix-ui/themes";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import FarmConnectLogo from "./FarmConnectLogo";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Clear local storage just in case
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (e) {}
    navigate("/login");
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
        borderBottom: "1px solid var(--gray-6)",
        backgroundColor: "var(--color-background)",
        width: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link asChild href="/" gap="5">
        <RouterLink
          to="/"
          style={{ textDecoration: "none", display: "inline-block" }}
        >
          <Heading size="6" weight="bold" style={{ margin: 0 }}>
            <FarmConnectLogo size={38} />
          </Heading>
        </RouterLink>
      </Link>
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
    </Flex>
  );
};

export default NavigationBar;
