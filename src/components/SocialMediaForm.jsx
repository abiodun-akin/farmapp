import { useEffect, useState } from "react";
import "./SocialMediaForm.css";

/**
 * SocialMediaForm Component
 * Form for editing social media profiles
 * Embedded in FarmerProfileForm and VendorProfileForm
 */
const SocialMediaForm = ({ initialData = {}, onChange, className = "" }) => {
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    whatsapp: "",
    website: "",
    ...initialData,
  });

  useEffect(() => {
    setSocialMedia({
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
      website: "",
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (field, value) => {
    const updated = { ...socialMedia, [field]: value };
    setSocialMedia(updated);
    onChange(updated);
  };

  const socialFields = [
    {
      name: "facebook",
      label: "Facebook",
      placeholder: "facebook.com/yourprofile or username",
      icon: "fab fa-facebook-f",
      color: "#1877F2",
    },
    {
      name: "twitter",
      label: "Twitter",
      placeholder: "@yourhandle",
      icon: "fab fa-twitter",
      color: "#1DA1F2",
    },
    {
      name: "instagram",
      label: "Instagram",
      placeholder: "@yourprofile",
      icon: "fab fa-instagram",
      color: "#E4405F",
    },
    {
      name: "linkedin",
      label: "LinkedIn",
      placeholder: "linkedin.com/in/yourprofile",
      icon: "fab fa-linkedin-in",
      color: "#0A66C2",
    },
    {
      name: "youtube",
      label: "YouTube",
      placeholder: "@yourchannel or channel URL",
      icon: "fab fa-youtube",
      color: "#FF0000",
    },
    {
      name: "whatsapp",
      label: "WhatsApp",
      placeholder: "+234 (with country code) or wa.me link",
      icon: "fab fa-whatsapp",
      color: "#25D366",
    },
    {
      name: "website",
      label: "Website",
      placeholder: "example.com or https://example.com",
      icon: "fas fa-globe",
      color: "#666",
    },
  ];

  return (
    <div className={`social-media-form ${className}`}>
      <h3>Social Media & Web Presence</h3>
      <p className="form-help-text">
        Add your social media profiles (optional)
      </p>

      <div className="social-fields-grid">
        {socialFields.map((field) => (
          <div key={field.name} className="social-form-group">
            <label htmlFor={`social-${field.name}`}>
              <i className={field.icon} style={{ color: field.color }}></i>
              {field.label}
            </label>
            <input
              id={`social-${field.name}`}
              type="text"
              placeholder={field.placeholder}
              value={socialMedia[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="social-input"
            />
            <small className="social-hint">
              {field.name === "facebook" && "Profile URL or username"}
              {field.name === "twitter" && "Include @ symbol"}
              {field.name === "instagram" && "Include @ symbol"}
              {field.name === "linkedin" && "Full LinkedIn URL"}
              {field.name === "youtube" && "Channel URL or handle"}
              {field.name === "whatsapp" && "Phone number with country code"}
              {field.name === "website" && "Full website URL"}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaForm;
