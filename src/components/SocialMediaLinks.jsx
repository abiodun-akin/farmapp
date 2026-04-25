import "./SocialMediaLinks.css";

/**
 * SocialMediaLinks Component
 * Displays user's social media profiles as clickable links
 * Used in marketplace listings and user profiles
 */
const SocialMediaLinks = ({ socialMedia, className = "" }) => {
  if (!socialMedia) return null;

  const socials = [
    {
      key: "facebook",
      label: "Facebook",
      icon: "fab fa-facebook-f",
      color: "#1877F2",
    },
    {
      key: "twitter",
      label: "Twitter",
      icon: "fab fa-twitter",
      color: "#1DA1F2",
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: "fab fa-instagram",
      color: "#E4405F",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      icon: "fab fa-linkedin-in",
      color: "#0A66C2",
    },
    {
      key: "youtube",
      label: "YouTube",
      icon: "fab fa-youtube",
      color: "#FF0000",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: "fab fa-whatsapp",
      color: "#25D366",
    },
    { key: "website", label: "Website", icon: "fas fa-globe", color: "#666" },
  ];

  const activeSocials = socials.filter(
    (social) => socialMedia[social.key] && socialMedia[social.key].trim(),
  );

  if (activeSocials.length === 0) return null;

  const handleClick = (social) => {
    let url = socialMedia[social.key];

    if (!url) return;

    // Add protocol if missing
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      if (social.key === "website" || social.key === "whatsapp") {
        url = `https://${url}`;
      } else if (!url.includes(`${social.key}.com`)) {
        // Only prepend domain if the user didn't already type it
        url = `https://${social.key}.com/${url}`;
      } else {
        url = `https://${url}`;
      }
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`social-media-links ${className}`}>
      <div className="social-links-container">
        {activeSocials.map((social) => (
          <button
            key={social.key}
            className="social-link-btn"
            onClick={() => handleClick(social)}
            title={social.label}
            style={{ "--social-color": social.color }}
            aria-label={`Open ${social.label}`}
          >
            <i className={social.icon}></i>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaLinks;
