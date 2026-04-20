import { Box } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "../components/Slider";
import PageLayout from "../layouts/PageLayout";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const slides = useMemo(
    () => [
      {
        id: 1,
        title: "Connect with Trusted Agro Vendors",
        subtitle:
          "Find verified suppliers, machinery experts, and service partners near you.",
        image:
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?auto=format&fit=crop&w=1920&q=75",
        mobileImage:
          "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?auto=format&fit=crop&w=900&q=70",
        cta: isAuthenticated ? "View Matches" : "Create Account",
        route: isAuthenticated ? "/matches" : "/signup",
      },
      {
        id: 2,
        title: "Build Better Farmer–Vendor Partnerships",
        subtitle:
          "Collaborate faster with structured messaging and smarter matching.",
        image:
          "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1920&q=75",
        mobileImage:
          "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=900&q=70",
        cta: isAuthenticated ? "Open Messages" : "See Pricing",
        route: isAuthenticated ? "/messages" : "/pricing",
      },
      {
        id: 3,
        title: "Grow with Flexible Subscription Plans",
        subtitle:
          "Activate, renew, and extend your plan seamlessly as your business scales.",
        image:
          "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1920&q=75",
        mobileImage:
          "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=70",
        cta: isAuthenticated ? "Go to Dashboard" : "Get Started",
        route: isAuthenticated ? "/dashboard" : "/signup",
      },
    ],
    [isAuthenticated],
  );

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
          minHeight: "100vh",
          padding: "0",
          margin: "0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isAuthenticated && (
          <div
            style={{
              position: "absolute",
              zIndex: 3,
              right: "clamp(16px, 4vw, 40px)",
              top: "clamp(100px, 15vh, 180px)",
            }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "#2d8659",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "clamp(14px, 2vw, 16px)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
              onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
            >
              Go to Dashboard
            </button>
          </div>
        )}
        <div style={{ flex: 1, height: "calc(100vh - 120px)" }}>
          <Slider
            slides={slides}
            currentSlide={currentSlide}
            setCurrentSlide={setCurrentSlide}
            isAutoplay={isAutoplay}
            setIsAutoplay={setIsAutoplay}
            navigate={navigate}
          />
        </div>

        {/* Additional Hero Section with Call-to-Actions */}
        <Box
          style={{
            background: "linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%)",
            padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 40px)",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 5vw, 36px)",
              color: "#193325",
              marginBottom: "12px",
              fontWeight: 700,
            }}
          >
            Transforming Agriculture in Nigeria
          </h2>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              color: "#555",
              marginBottom: "28px",
              maxWidth: "600px",
              margin: "0 auto 28px",
            }}
          >
            FarmConnect is the trusted platform connecting farmers, vendors, and
            service providers across Nigeria. Build stronger business
            relationships and grow your agricultural enterprise.
          </p>

          <div
            style={{
              display: "flex",
              gap: "clamp(12px, 3vw, 20px)",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  style={{
                    background: "#2d8659",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "clamp(10px, 2vw, 14px) clamp(20px, 4vw, 32px)",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#1f5f3d")}
                  onMouseLeave={(e) => (e.target.style.background = "#2d8659")}
                >
                  Sign Up Now
                </button>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    background: "transparent",
                    color: "#2d8659",
                    border: "2px solid #2d8659",
                    borderRadius: "8px",
                    padding: "clamp(8px, 2vw, 12px) clamp(18px, 4vw, 30px)",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#2d8659";
                    e.target.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#2d8659";
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "clamp(16px, 3vw, 24px)",
              marginTop: "32px",
            }}
          >
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🤝</div>
              <h3
                style={{
                  color: "#193325",
                  fontSize: "clamp(16px, 2.5vw, 18px)",
                  marginBottom: "8px",
                }}
              >
                Verified Connections
              </h3>
              <p
                style={{ color: "#666", fontSize: "clamp(13px, 1.5vw, 14px)" }}
              >
                Connect with trusted farmers and vendors in your region
              </p>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>�</div>
              <h3
                style={{
                  color: "#193325",
                  fontSize: "clamp(16px, 2.5vw, 18px)",
                  marginBottom: "8px",
                }}
              >
                Easy Messaging
              </h3>
              <p
                style={{ color: "#666", fontSize: "clamp(13px, 1.5vw, 14px)" }}
              >
                Communicate seamlessly and manage partnerships efficiently
              </p>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>💼</div>
              <h3
                style={{
                  color: "#193325",
                  fontSize: "clamp(16px, 2.5vw, 18px)",
                  marginBottom: "8px",
                }}
              >
                Flexible Plans
              </h3>
              <p
                style={{ color: "#666", fontSize: "clamp(13px, 1.5vw, 14px)" }}
              >
                Upgrade or extend your subscription as your business grows
              </p>
            </div>
          </div>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default Landing;
