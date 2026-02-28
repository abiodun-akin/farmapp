import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./ProfileTypeSelector.css";
import { userApi } from "../api/userApi";

/**
 * Profile Type Selector Component
 * Allows user to choose between Farmer and Vendor profile type
 */
const ProfileTypeSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if profile already exists
    if (profile && profile.profileType) {
      // Redirect to appropriate form
      navigate(`/profile/${profile.profileType}`);
    }
  }, [profile, navigate]);

  const handleSelectType = async (type) => {
    setSelectedType(type);
    setSubmitting(true);

    try {
      const response = await userApi.initializeProfile(type);
      
      // Store profile type in redux
      dispatch({
        type: "user/setProfile",
        payload: response.profile,
      });

      // Redirect to profile completion form
      navigate(`/profile/${type}`);
    } catch (err) {
      console.error("Error initializing profile:", err);
      setSubmitting(false);
    }
  };

  return (
    <div className="profile-type-selector-container">
      <div className="profile-type-selector">
        <h1>Complete Your Profile</h1>
        <p className="subtitle">
          Help us match you with the right partners. What's your role?
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="type-options">
          <div
            className={`type-card farmer ${selectedType === "farmer" ? "selected" : ""}`}
            onClick={() => handleSelectType("farmer")}
            disabled={submitting}
          >
            <div className="type-icon">🌾</div>
            <h2>Farmer</h2>
            <p>I grow crops or raise animals</p>
            <ul className="type-benefits">
              <li>Connect with suppliers and service providers</li>
              <li>Find market opportunities</li>
              <li>Get expert advice</li>
            </ul>
          </div>

          <div
            className={`type-card vendor ${selectedType === "vendor" ? "selected" : ""}`}
            onClick={() => handleSelectType("vendor")}
            disabled={submitting}
          >
            <div className="type-icon">🏪</div>
            <h2>Vendor</h2>
            <p>I provide agricultural services or products</p>
            <ul className="type-benefits">
              <li>Find farmers who need your services</li>
              <li>Expand your customer base</li>
              <li>Build lasting partnerships</li>
            </ul>
          </div>
        </div>

        {submitting && <div className="loading">Setting up your profile...</div>}
      </div>
    </div>
  );
};

export default ProfileTypeSelector;
