import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

const Slider = ({
  slides,
  currentSlide,
  setCurrentSlide,
  isAutoplay,
  setIsAutoplay,
  navigate,
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

  const handleCtaClick = (e) => {
    e.stopPropagation();
    const route = slides[currentSlide].route;
    if (route) {
      setIsAutoplay(false);
      navigate(route);
    }
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
          <button
            style={{
              background: "#2ecc71",
              color: "white",
              padding: "12px 30px",
              fontSize: "16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={handleCtaClick}
          >
            {slides[currentSlide].cta}
          </button>
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

export default Slider;
