import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Box, Button } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

const slides = [
  {
    id: 1,
    title: "Fresh Farm Produce",
    subtitle: "Direct from farmers to your table",
    image:
      "https://images.unsplash.com/photo-1488459716781-6f3ee3c3dd09?w=1200&h=600&fit=crop",
    cta: "Browse Produce",
  },
  {
    id: 2,
    title: "Connect with Local Farmers",
    subtitle: "Support sustainable agriculture",
    image:
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop",
    cta: "Find Farmers",
  },
  {
    id: 3,
    title: "Secure Marketplace",
    subtitle: "Trade with confidence and transparency",
    image:
      "https://images.unsplash.com/photo-1500382017468-7049fae79249?w=1200&h=600&fit=crop",
    cta: "Start Trading",
  },
];

const Slider = ({
  slides,
  currentSlide,
  setCurrentSlide,
  isAutoplay,
  setIsAutoplay,
}) => {
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoplay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoplay(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoplay(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "0",
      }}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === currentSlide ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
          }}
        />
      ))}

      {/* Overlay with Content */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <div
          style={{
            textAlign: "center",
            color: "white",
            zIndex: 3,
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            {slides[currentSlide].title}
          </h1>
          <p style={{ fontSize: "20px", margin: "0 0 30px 0" }}>
            {slides[currentSlide].subtitle}
          </p>
          <Button
            size="3"
            style={{
              background: "#2ecc71",
              color: "white",
              padding: "12px 30px",
              fontSize: "16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {slides[currentSlide].cta}
          </Button>
        </div>
      </div>

      {/* Left Navigation Button */}
      <button
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
          background: "rgba(255, 255, 255, 0.8)",
          border: "none",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s ease",
        }}
        onClick={prevSlide}
        onMouseEnter={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 1)")
        }
        onMouseLeave={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.8)")
        }
      >
        <ChevronLeftIcon width={24} height={24} />
      </button>

      {/* Right Navigation Button */}
      <button
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 4,
          background: "rgba(255, 255, 255, 0.8)",
          border: "none",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.3s ease",
        }}
        onClick={nextSlide}
        onMouseEnter={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 1)")
        }
        onMouseLeave={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.8)")
        }
      >
        <ChevronRightIcon width={24} height={24} />
      </button>

      {/* Dot Navigation */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          zIndex: 4,
        }}
      >
        {slides.map((_, index) => (
          <div
            key={index}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor:
                index === currentSlide
                  ? "rgba(255, 255, 255, 1)"
                  : "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

const Landing = () => {
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
        }}
      >
        <Slider
          slides={slides}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          isAutoplay={isAutoplay}
          setIsAutoplay={setIsAutoplay}
        />
      </Box>
    </PageLayout>
  );
};

export default Landing;
