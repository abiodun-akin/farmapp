import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./FarmerProfileForm.css";
import { userApi } from "../../api/userApi";
import { useForm } from "../../hooks/useForm";

/**
 * Farmer Profile Form Component
 * Collects detailed farmer information with dropdown fields
 */
const FarmerProfileForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { formData, handleChange, handleArrayChange, errors } = useForm({
    phone: "",
    location: "",
    state: "",
    lga: "",
    bio: "",
    farmerDetails: {
      farmingAreas: [],
      cropsProduced: [],
      animalsRaised: [],
      farmSize: "",
      yearsOfExperience: "",
      certifications: [],
      interests: [],
      additionalInfo: "",
    },
  });

  // Dropdown options
  const farmingAreas = [
    "Dry Season Farming",
    "Wet Season Farming",
    "Mixed Farming",
    "Organic Farming",
    "Commercial Farming",
  ];

  const crops = [
    "Maize",
    "Rice",
    "Cassava",
    "Yam",
    "Vegetables",
    "Beans",
    "Sorghum",
    "Groundnuts",
  ];

  const animals = [
    "Cattle",
    "Poultry",
    "Goats",
    "Sheep",
    "Pigs",
    "Fish",
    "Rabbits",
  ];

  const farmSizes = [
    "Less than 1 hectare",
    "1-5 hectares",
    "5-10 hectares",
    "10-20 hectares",
    "More than 20 hectares",
  ];

  const experiences = [
    "Less than 1 year",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "More than 10 years",
  ];

  const certifications = [
    "Organic Certification",
    "ISO 9001",
    "GAP Certification",
    "Other",
  ];

  const interests = [
    "Seeds & Seedlings",
    "Fertilizers",
    "Pesticides",
    "Farm Equipment",
    "Irrigation Systems",
    "Market Access",
    "Storage Solutions",
    "Training",
  ];

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benu",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "FCT",
  ];

  const handleMultiSelect = (fieldName, value) => {
    const currentArray = formData.farmerDetails[fieldName] || [];
    const updated = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    handleArrayChange(fieldName, updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.phone || !formData.location || !formData.state) {
        throw new Error("Please fill in all required fields");
      }

      if (
        formData.farmerDetails.farmingAreas.length === 0 ||
        formData.farmerDetails.cropsProduced.length === 0 ||
        !formData.farmerDetails.yearsOfExperience ||
        formData.farmerDetails.interests.length === 0
      ) {
        throw new Error("Please complete all profile details");
      }

      const response = await userApi.completeFarmerProfile(formData);

      setSuccess(true);
      // Dispatch to update redux state
      dispatch({
        type: "user/setProfile",
        payload: response.profile,
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.message || "Error saving profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="profile-form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Profile Completed Successfully!</h2>
          <p>Your farmer profile has been saved. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-form-container">
      <form className="farmer-profile-form" onSubmit={handleSubmit}>
        <h1>Complete Your Farmer Profile</h1>
        <p className="form-subtitle">
          Help us understand your farming background and interests
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Contact Information */}
        <div className="form-section">
          <h2>Contact Information</h2>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g., +234 800 000 0000"
              required
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">State *</label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              >
                <option value="">Select State</option>
                {nigerianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && <span className="error">{errors.state}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lga">Local Government Area</label>
              <input
                type="text"
                id="lga"
                name="lga"
                value={formData.lga}
                onChange={handleChange}
                placeholder="Your LGA"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Specific Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Somewhere in Lagos"
              required
            />
            {errors.location && <span className="error">{errors.location}</span>}
          </div>
        </div>

        {/* Farming Background */}
        <div className="form-section">
          <h2>Farming Background</h2>

          <div className="form-group">
            <label>Farming Areas *</label>
            <div className="checkbox-group">
              {farmingAreas.map((area) => (
                <label key={area} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.farmingAreas.includes(area)}
                    onChange={() => handleMultiSelect("farmingAreas", area)}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Crops Produced *</label>
            <div className="checkbox-group">
              {crops.map((crop) => (
                <label key={crop} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.cropsProduced.includes(crop)}
                    onChange={() => handleMultiSelect("cropsProduced", crop)}
                  />
                  {crop}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Animals/Livestock Raised</label>
            <div className="checkbox-group">
              {animals.map((animal) => (
                <label key={animal} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.animalsRaised.includes(animal)}
                    onChange={() => handleMultiSelect("animalsRaised", animal)}
                  />
                  {animal}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="farmSize">Farm Size</label>
              <select
                id="farmSize"
                name="farmSize"
                value={formData.farmerDetails.farmSize}
                onChange={(e) =>
                  handleArrayChange("farmSize", e.target.value)
                }
              >
                <option value="">Select Farm Size</option>
                {farmSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experience">Years of Experience *</label>
              <select
                id="experience"
                name="yearsOfExperience"
                value={formData.farmerDetails.yearsOfExperience}
                onChange={(e) =>
                  handleArrayChange("yearsOfExperience", e.target.value)
                }
                required
              >
                <option value="">Select Experience</option>
                {experiences.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Qualifications & Interests */}
        <div className="form-section">
          <h2>Qualifications & Interests</h2>

          <div className="form-group">
            <label>Certifications</label>
            <div className="checkbox-group">
              {certifications.map((cert) => (
                <label key={cert} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.certifications.includes(cert)}
                    onChange={() => handleMultiSelect("certifications", cert)}
                  />
                  {cert}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>What are you interested in? *</label>
            <div className="checkbox-group">
              {interests.map((interest) => (
                <label key={interest} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.farmerDetails.interests.includes(interest)}
                    onChange={() => handleMultiSelect("interests", interest)}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">About You</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about your farming and what you're looking for..."
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.farmerDetails.additionalInfo}
              onChange={(e) =>
                handleArrayChange("additionalInfo", e.target.value)
              }
              placeholder="Any other details you'd like to share..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={submitting}
        >
          {submitting ? "Saving Profile..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
};

export default FarmerProfileForm;
