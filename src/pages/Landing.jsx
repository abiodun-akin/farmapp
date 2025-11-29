import { Box, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "../components/Slider";
import PageLayout from "../layouts/PageLayout";

const slides = [
  {
    id: 1,
    title: "Connect with Vendors",
    subtitle: "Browse a wide range of vendors looking to connect with you",
    image:
      "https://images.unsplash.com/photo-1488459716781-6f3ee3c3dd09?w=1200&h=600&fit=crop",
    cta: "Browse Vendors",
    route: "/signup",
  },
  {
    id: 2,
    title: "Connect with Local Farmers",
    subtitle: "Support sustainable agriculture",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop",
    cta: "Find Farmers",
    route: "/signup",
  },
  {
    id: 3,
    title:
      "Secure and Reliable platform for Agricultural investments across Africa",
    subtitle: "Get involved and make your mark in the agricultural world",
    image:
      "https://images.unsplash.com/photo-1500382017468-7049fae79249?w=1200&h=600&fit=crop",
    cta: "Get Started",
    route: "/signup",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoplay, slides.length]);

  return (
    <PageLayout
      showLeftPanel={true}
      maxWidth="100%"
      title={null}
      fullBleed={true}
    >
      <Box
        style={{
          width: "100%",
          height: "calc(100vh - 120px)",
          padding: "0",
          margin: "0",
          position: "relative",
        }}
      >
        <Text
          size="3"
          weight="bold"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            backgroundColor: "#10b981",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            zIndex: 10,
          }}
        >
          Verification code: OS7K3L
        </Text>
        <Slider
          slides={slides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          isAutoplay={isAutoplay}
          setIsAutoplay={setIsAutoplay}
          navigate={navigate}
        />
      </Box>
    </PageLayout>
  );
};

export default Landing;
