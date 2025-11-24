import { Box, Button, Flex, Grid, Heading, Link, Text } from "@radix-ui/themes";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const FeatureCard = ({ icon, title, description }) => (
  <Flex gap="3" align="start">
    <Box
      color="var(--color-pry-800)"
      style={{ fontSize: "var(--font-size-6)" }}
    >
      {icon}
    </Box>
    <Box>
      <Heading size="3" mb="1" color="var(--color-pry-800)">
        {title}
      </Heading>
      <Text as="p" size="2" color="gray">
        {description}
      </Text>
    </Box>
  </Flex>
);

const LeftContent = ({ leftContent }) => {
  if (leftContent) return leftContent;

  return (
    <Flex direction="column" gap="7" p="9" wrap="wrap">
      <Heading size="8" style={{ lineHeight: "1.2" }}>
        Welcome to{" "}
        <Text
          style={{ lineHeight: "1.2", color: "var(--color-pry-800)" }}
          weight="bold"
        >
          Farm Connect
        </Text>
      </Heading>

      <FeatureCard
        icon=""
        title="A Journey"
        description="A journey where farmers, vendors and service providers meet, trade and thrive. "
      />
      <FeatureCard
        icon=""
        title="Connection & Growth"
        description="Rooted in connection, growing toward the future!"
      />

      <Box
        mt="5"
        height="200px"
        style={{
          borderRadius: "var(--radius-3)",
          backgroundColor: "var(--gray-3)",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&h=800&fit=crop&auto=format&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        role="img"
        aria-label="Farmers working in a field"
      />
    </Flex>
  );
};

const PageLayout = ({
  title,
  children,
  leftContent,
  showLeftPanel = true,
  maxWidth = "400px",
  fullBleed = false,
}) => {
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
      direction="column"
      minHeight="100vh"
      style={{
        backgroundColor: "var(--color-pry-200)",
        backgroundImage: "url(images/bg1.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: fullBleed ? "100vh" : undefined,
      }}
    >
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
            <Heading
              size="6"
              weight="bold"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyItems: "center",
                color: "var(--color-pry-800)",
                margin: 0,
                marginBottom: 10,
                padding: 0,
                height: 100,
              }}
            >
              <svg
                width="130"
                height="130"
                viewBox="0 0 90 90"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="scale(0.25) translate(-100, -100)">
                  <path
                    d="M308.597 160.498C283.079 128.568 219.476 136.983 166.526 179.299C113.577 221.615 91.3447 281.798 116.863 313.728L143.969 292.066C169.487 323.996 233.091 315.581 286.04 273.265C338.989 230.949 361.221 170.766 335.703 138.836L308.597 160.498ZM266.605 276.736C256.626 284.711 244.506 289.548 231.779 290.634C219.051 291.721 206.287 289.01 195.1 282.842C183.914 276.675 174.807 267.329 168.932 255.986C163.057 244.643 160.678 231.813 162.095 219.117C163.512 206.422 168.662 194.432 176.893 184.664C185.124 174.895 196.067 167.787 208.339 164.238C220.61 160.689 233.658 160.858 245.832 164.725C258.007 168.591 268.762 175.981 276.737 185.96C287.431 199.341 292.371 216.423 290.471 233.446C288.571 250.47 279.986 266.042 266.605 276.736Z"
                    fill="currentColor"
                  />
                </g>
                <text
                  x="50"
                  y="70"
                  fontSize="12"
                  textAnchor="middle"
                  fill="var(--color-sec-700)"
                >
                  Farm Connect
                </text>
              </svg>
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
                <RouterLink to="/signup">Create Account</RouterLink>
              </Link>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/login">Sign In</RouterLink>
              </Link>
            </>
          ) : (
            <>
              <Link asChild weight="medium" size="2" color="gray">
                <RouterLink to="/">Account</RouterLink>
              </Link>
              <Button variant="ghost" onClick={handleLogout} size="2">
                Logout
              </Button>
            </>
          )}
        </Flex>
      </Flex>

      <Grid
        columns={{ initial: "1", lg: showLeftPanel ? "700px 1fr" : "1fr" }}
        gap="0"
        style={{
          flexGrow: 1,
          backgroundImage: "url(../../assets/images/bg1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: fullBleed ? "calc(100vh - 120px)" : undefined,
        }}
      >
        {showLeftPanel && (
          <Box
            style={{
              backgroundColor: "var(--color-background)",
              display: "block",
              borderRight: "1px solid var(--gray-6)",
            }}
            display={{ initial: "none", lg: "block" }}
          >
            <LeftContent leftContent={leftContent} />
          </Box>
        )}

        <Flex
          align={fullBleed ? "stretch" : "center"}
          justify="center"
          p={{ initial: fullBleed ? "0" : "5", lg: fullBleed ? "0" : "9" }}
          style={{ width: "100%", height: fullBleed ? "100%" : undefined }}
        >
          <Box
            width="100%"
            maxWidth={fullBleed ? "100%" : maxWidth}
            style={{
              backgroundColor: fullBleed
                ? "transparent"
                : "var(--color-background)",
              borderRadius: fullBleed ? 0 : "var(--radius-3)",
              boxShadow: fullBleed ? "none" : "var(--shadow-4)",
              height: fullBleed ? "100%" : undefined,
            }}
            p={fullBleed ? "0" : "6"}
          >
            {title && (
              <>
                <Heading size="7" align="center" mb="2">
                  {title}
                </Heading>
                <Text as="p" size="3" color="gray" align="center" mb="5">
                  Start your free trial today.
                </Text>
              </>
            )}

            {children}
          </Box>
        </Flex>
      </Grid>
    </Flex>
  );
};

export default PageLayout;
