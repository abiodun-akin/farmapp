import { Button, Card, Flex, Typography } from "antd";

const cardStyle = {
  width: 620,
};

const imgStyle = {
  display: "block",
  width: 273,
};

const Landing = () => (
  <div style={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
    <Card
      hoverable
      style={cardStyle}
      styles={{ body: { padding: 0, overflow: "hidden" } }}
    >
      <Flex justify="space-between">
        <img
          alt="avatar"
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          style={imgStyle}
        />
        <Flex
          vertical
          align="flex-end"
          justify="space-between"
          style={{ padding: 32 }}
        >
          <Typography.Title level={3}>
            “antd is an enterprise-class UI design language and React UI
            library.”
          </Typography.Title>
          <Button type="primary" href="https://ant.design" target="_blank">
            Get Started
          </Button>
        </Flex>
      </Flex>
    </Card>

    <Card
      hoverable
      style={cardStyle}
      styles={{ body: { padding: 0, overflow: "hidden" } }}
    >
      <Flex justify="space-between">
        <img
          alt="avatar"
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          style={imgStyle}
        />
        <Flex
          vertical
          align="flex-end"
          justify="space-between"
          style={{ padding: 32 }}
        >
          <Typography.Title level={3}>
            “antd is an enterprise-class UI design language and React UI
            library.”
          </Typography.Title>
          <Button type="primary" href="https://ant.design" target="_blank">
            Get Started
          </Button>
        </Flex>
      </Flex>
    </Card>
  </div>
);

export default Landing;
