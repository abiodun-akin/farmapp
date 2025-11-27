import { Flex } from "@radix-ui/themes";
import NavigationBar from "../components/NavigationBar";

const FullPageLayout = ({ children }) => {
  return (
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
      <Flex
        style={{
          flexGrow: 1,
          backgroundImage: "url(../../assets/images/bg1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default FullPageLayout;
