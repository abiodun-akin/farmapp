import { Flex } from "@radix-ui/themes";
import NavigationBar from "../components/NavigationBar";

const FullPageLayout = ({ children }) => {
  return (
    <Flex
      direction="column"
      minHeight="100vh"
      style={{
        backgroundColor: "var(--color-pry-200)",
      }}
    >
      <NavigationBar />
      <Flex
        style={{
          flexGrow: 1,
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: "url(/images/bg1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          overflow: "hidden",
        }}
      >
        {/* Fade-out overlay gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(200, 240, 200, 0.5) 0%, rgba(200, 240, 200, 0.6) 50%, rgba(200, 240, 200, 0.7) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Content wrapper with relative positioning */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
          {children}
        </div>
      </Flex>
    </Flex>
  );
};

export default FullPageLayout;
