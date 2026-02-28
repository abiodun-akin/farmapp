import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "./VendorProfileForm.css";
import { userApi } from "../api/userApi";
import { useForm } from "../hooks/useForm";

/**
 * Vendor Profile Form Component
 * Collects detailed vendor/service provider information
 */
const VendorProfileForm = () => {
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
    bio: "",
    vendorDetails: {
      businessType: "",
      servicesOffered: [],
      yearsInBusiness: "",
      certifications: [],
      operatingAreas: [],
      businessRegistration: "",
      offersCredit: false,
      interests: [],
      additionalInfo: "",
    },
  });

  // Dropdown options
  const businessTypes = [
    "Input Supplier",
    "Equipment Provider",
    "Financial Services",
    "Extension Services",
    "Processing/Storage",
    "Trading/Marketing",
    "Livestock Services",
    "Veterinary Services",
    "Transportation",
    "Other",
  ];

  const services = [
    "Seeds & Seedlings",
    "Fertilizers",
    "Pesticides",
    "Farm Equipment Rental",
    "Irrigation Systems",
    "Farm Machinery Services",
    "Extension Advisory",
    "Training Programs",
    "Market Linkage",
    "Storage Solutions",
    "Credit/Financing",
    "Veterinary Care",
    "Livestock Trading",
    "Processing Services",
  ];

  const certifications = [
    "Business Registration",
    "Quality Assurance",
    "ISO Certified",
    "Health & Safety",
    "Environmental Compliance",
    "Other",
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

  const operatingAreas = [
    "North West",
    "North East",
    "North Central",
    "South West",
    "South East",
    "South South",
  ];

  const yearsOptions = [
    "Less than 1 year",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "More than 10 years",
  ];

  const interests = [
    "Supply Chain Development",
    "Farmer Partnerships",
    "Market Expansion",
    "Government Contracts",
    "Export Opportunities",
    "Capacity Building",
    "Technology Integration",
    "Certification Help",
  ];

  const handleMultiSelect = (fieldName, value) => {
    const currentArray = formData.vendorDetails[fieldName] || [];
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
        !formData.vendorDetails.businessType ||
        formData.vendorDetails.servicesOffered.length === 0 ||
        !formData.vendorDetails.yearsInBusiness ||
        formData.vendorDetails.operatingAreas.length === 0 ||
        formData.vendorDetails.interests.length === 0
      ) {
        throw new Error("Please complete all profile details");
      }

      const response = await userApi.completeVendorProfile(formData);

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
          <p>Your vendor profile has been saved. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-form-container">
      <form className="vendor-profile-form" onSubmit={handleSubmit}>
        <h1>Complete Your Vendor Profile</h1>
        <p className="form-subtitle">
          Help farmers find and connect with your services
        </p>

        {error && <div className="error-message">{error}</div>}

        {/* Contact & Location */}
        <div className="form-section">
          <h2>Contact & Location</h2>

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
              <label htmlFor="location">City/Town *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your business location"
                required
              />
              {errors.location && <span className="error">{errors.location}</span>}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="form-section">
          <h2>Business Information</h2>

          <div className="form-group">
            <label htmlFor="businessType">Business Type *</label>
            <select
              id="businessType"
              name="businessType"
              value={formData.vendorDetails.businessType}
              onChange={(e) => handleArrayChange("businessType", e.target.value)}
              required
            >
              <option value="">Select Business Type</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Services Offered *</label>
            <div className="checkbox-group">
              {services.map((service) => (
                <label key={service} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vendorDetails.servicesOffered.includes(
                      service
                    )}
                    onChange={() => handleMultiSelect("servicesOffered", service)}
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="yearsInBusiness">Years in Business *</label>
              <select
                id="yearsInBusiness"
                name="yearsInBusiness"
                value={formData.vendorDetails.yearsInBusiness}
                onChange={(e) => handleArrayChange("yearsInBusiness", e.target.value)}
                required
              >
                <option value="">Select Years</option>
                {yearsOptions.map((years) => (
                  <option key={years} value={years}>
                    {years}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="businessRegistration">
                Business Registration Number
              </label>
              <input
                type="text"
                id="businessRegistration"
                name="businessRegistration"
                value={formData.vendorDetails.businessRegistration}
                onChange={(e) =>
                  handleArrayChange("businessRegistration", e.target.value)
                }
                placeholder="e.g., BN/123456"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.vendorDetails.offersCredit}
                onChange={(e) =>
                  handleArrayChange("offersCredit", e.target.checked)
                }
              />
              We offer credit/financing options
            </label>
          </div>
        </div>

        {/* Service Coverage & Details */}
        <div className="form-section">
          <h2>Service Coverage & Details</h2>

          <div className="form-group">
            <label>Operating Areas *</label>
            <div className="checkbox-group">
              {operatingAreas.map((area) => (
                <label key={area} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vendorDetails.operatingAreas.includes(area)}
                    onChange={() => handleMultiSelect("operatingAreas", area)}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Certifications & Compliance</label>
            <div className="checkbox-group">
              {certifications.map((cert) => (
                <label key={cert} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vendorDetails.certifications.includes(cert)}
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
                    checked={formData.vendorDetails.interests.includes(interest)}
                    onChange={() => handleMultiSelect("interests", interest)}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">About Your Business</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your business and what you offer..."
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="additionalInfo">Additional Information</label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.vendorDetails.additionalInfo}
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

export default VendorProfileForm;
