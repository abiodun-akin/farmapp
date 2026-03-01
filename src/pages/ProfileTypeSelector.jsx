import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTractor, FaStore } from "react-icons/fa";
import "./ProfileTypeSelector.css";
import { userApi } from "../api/userApi";
import { setProfile } from "../redux/slices/userSlice";

/**
 * Profile Type Selector Component
 * Allows user to choose between Farmer and Vendor profile type
 */
const ProfileTypeSelector = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Check if profile already exists
    if (user && user.profileType) {
      // Redirect to appropriate form
      navigate(`/profile/${user.profileType}`);
    }
  }, [user, navigate]);

  const handleSelectType = async (type) => {
    setSelectedType(type);
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await userApi.initializeProfile(type);
      
      // Store profile type in redux
      dispatch(setProfile(response.profile));

      // Redirect to profile completion form
      navigate(`/profile/${type}`);
    } catch (err) {
      console.error("Error initializing profile:", err);
      
      // Handle specific error codes
      if (err.response?.data?.code === "PROFILE_ALREADY_COMPLETE") {
        setErrorMessage("Your profile is already complete. Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setErrorMessage(err.response?.data?.error || "Failed to initialize profile. Please try again.");
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="profile-type-selector-container">
      <div className="profile-type-selector">
        <h1>Complete Your Profile</h1>
        <p className="subtitle">
          Help us match you with the right partners. What's your role?
        </p>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="type-options">
          <div
            className={`type-card farmer ${selectedType === "farmer" ? "selected" : ""}`}
            onClick={() => handleSelectType("farmer")}
            disabled={submitting}
          >
            <div className="type-icon">
              <FaTractor size={48} color="#3b7a57" />
            </div>
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
            <div className="type-icon">
              <FaStore size={48} color="#7c4f2c" />
            </div>
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
