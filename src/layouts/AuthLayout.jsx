import { Box, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import NavigationBar from "../components/NavigationBar";

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

const LeftContent = () => (
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
        backgroundImage: "url('images/farmconnect.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      role="img"
      aria-label="Farmers working in a field"
    />
  </Flex>
);

const AuthLayout = ({ title, children }) => (
  <Flex
    direction="column"
    minHeight="100vh"
    style={{
      backgroundColor: "var(--color-pry-200)",
      backgroundImage: "url(images/bg1.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <NavigationBar />

    <Grid
      columns={{ initial: "1", lg: "700px 1fr" }}
      gap="0"
      style={{
        flexGrow: 1,
        backgroundImage: "url(../../assets/images/bg1.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        style={{
          backgroundColor: "var(--color-background)",
          display: "block",
          borderRight: "1px solid var(--gray-6)",
        }}
        display={{ initial: "none", lg: "block" }}
      >
        <LeftContent />
      </Box>

      <Flex
        align="center"
        justify="center"
        p={{ initial: "5", lg: "9" }}
        style={{ width: "100%" }}
      >
        <Box
          width="100%"
          maxWidth="400px"
          style={{
            backgroundColor: "var(--color-background)",
            borderRadius: "var(--radius-3)",
            boxShadow: "var(--shadow-4)",
          }}
          p="6"
        >
          <Heading size="7" align="center" mb="2">
            {title}
          </Heading>
          <Text as="p" size="3" color="gray" align="center" mb="5">
            Start your free trial today.
          </Text>

          {children}
        </Box>
      </Flex>
    </Grid>
  </Flex>
);

export default AuthLayout;
