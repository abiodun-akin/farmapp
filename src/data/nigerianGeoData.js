/**
 * Nigerian Geographic and Agricultural Data
 * Contains state-LGA mappings and comprehensive agriculture value chain data
 */

import NaijaStates from "naija-state-local-government";

const normalizeStateName = (state) => {
  if (state === "Federal Capital Territory") return "FCT";
  if (state === "Nassarawa") return "Nasarawa";
  return state;
};

const denormalizeStateName = (state) => {
  if (state === "FCT") return "Federal Capital Territory";
  if (state === "Nasarawa") return "Nassarawa";
  return state;
};

export const nigerianStates = NaijaStates.states()
  .map(normalizeStateName)
  .sort((a, b) => a.localeCompare(b));

/**
 * State-LGA mapping for Nigeria
 * Maps each state to its local government areas
 */
export const stateLGAMap = {
  ...Object.fromEntries(
    nigerianStates.map((state) => {
      const lookupState = denormalizeStateName(state);
      const stateData = NaijaStates.lgas(lookupState);
      const lgas = Array.isArray(stateData?.lgas)
        ? stateData.lgas.map((lga) => lga.trim())
        : [];

      return [state, lgas];
    })
  ),
};

/**
 * Comprehensive agriculture value chain areas for Farmers
 */
export const farmerInterests = [
  // Input Supply
  "Seeds & Seedlings",
  "Fertilizers",
  "Pesticides & Phytosanitary Products",
  "Farm Equipment & Machinery",
  "Irrigation Systems",
  "Storage Solutions",

  // Production & Extension
  "Agro-Advisories & Extension Services",
  "Weather & Climate Information",
  "Soil Analysis & Testing",
  "Crop Protection Services",
  "Livestock Care & Veterinary Services",

  // Market Access
  "Market Information & Commodity Prices",
  "Buyer Linkages & Direct Sales",
  "Aggregation Services",
  "Export Opportunities",
  "Local Markets",

  // Support Services
  "Training & Capacity Building",
  "Financial Services & Loans",
  "Insurance Services",
  "Land Aggregation & Leasing",
  "Equipment Rental",

  // Value Addition
  "Food Processing Equipment",
  "Packaging Materials",
  "Marketing & Branding Support",
  "Quality Certification (Organic, GAP)",

  // Logistics
  "Transportation & Logistics",
  "Warehousing & Cold Storage",
  "Distribution Networks",

  // Other
  "Other (Please specify)",
];

/**
 * Comprehensive agriculture value chain areas for Vendors
 */
export const vendorInterests = [
  // B2B Partnerships
  "Farmer Direct Partnerships",
  "Bulk Procurement Arrangements",
  "Supply Chain Integration",
  "Framework Agreements",

  // Market Expansion
  "Market Expansion Opportunities",
  "Regional Distribution Networks",
  "Export Markets",
  "Government Contracts",
  "Institutional Sales (Schools, Hospitals)",

  // Product Services
  "Product Development & Innovation",
  "Quality Improvement",
  "Certification & Compliance",
  "Packaging & Branding",

  // Business Growth
  "Business Development & Networking",
  "Technology Integration",
  "Digital Marketing & E-commerce",
  "Training & Capacity Building",

  // Supply Chain
  "Supply Chain Development",
  "Logistics & Transportation",
  "Warehousing & Storage Solutions",
  "Cold Chain Services",

  // Environment & Sustainability
  "Environmental Compliance",
  "Sustainable Practices",
  "Climate Change Adaptation",
  "Waste Management",

  // Other
  "Other (Please specify)",
];

/**
 * Farming types/areas
 */
export const farmingAreas = [
  "Dry Season Farming",
  "Wet Season Farming",
  "Mixed Farming",
  "Organic Farming",
  "Commercial Farming",
  "Subsistence Farming",
  "Contract Farming",
  "Precision Agriculture",
];

/**
 * Crops produced
 */
export const crops = [
  "Maize",
  "Rice",
  "Cassava",
  "Yam",
  "Vegetables (Tomato, Onion, etc.)",
  "Beans",
  "Sorghum",
  "Groundnuts",
  "Millet",
  "Cocoa",
  "Cashew",
  "Coconut",
  "Plantain",
  "Banana",
  "Citrus",
  "Avocado",
  "Ginger",
  "Pepper",
  "Other",
];

/**
 * Animals/Livestock
 */
export const animals = [
  "Cattle",
  "Poultry (Chickens)",
  "Goats",
  "Sheep",
  "Pigs",
  "Fish/Aquaculture",
  "Rabbits",
  "Snails",
  "Honeybees",
  "Ducks",
  "Guinea Fowl",
];

/**
 * Farm sizes
 */
export const farmSizes = [
  "Less than 1 hectare",
  "1-5 hectares",
  "5-10 hectares",
  "10-20 hectares",
  "20-50 hectares",
  "More than 50 hectares",
];

/**
 * Years of experience
 */
export const yearsOfExperience = [
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "More than 10 years",
];

/**
 * Certifications
 */
export const certifications = [
  "Organic Certification",
  "ISO 9001",
  "GAP Certification",
  "GlobalG.A.P",
  "Fair Trade Certification",
  "Rainforest Alliance",
  "Other",
];

/**
 * Vendor business types
 */
export const vendorBusinessTypes = [
  "Input Supplier (Seeds, Fertilizers, etc.)",
  "Equipment Supplier",
  "Service Provider (Extension, Consulting)",
  "Buyer/Aggregator",
  "Processor/Manufacturer",
  "Logistics/Transportation",
  "Financial Services",
  "Other",
];

/**
 * Get LGAs for a selected state
 * @param {string} state - State name
 * @returns {Array} List of LGAs in the state
 */
export const getLGAsForState = (state) => {
  if (!state) return [];

  if (stateLGAMap[state]) {
    return stateLGAMap[state];
  }

  const normalized = normalizeStateName(state);
  if (stateLGAMap[normalized]) {
    return stateLGAMap[normalized];
  }

  const denormalized = denormalizeStateName(state);
  return stateLGAMap[normalizeStateName(denormalized)] || [];
};

export default {
  nigerianStates,
  stateLGAMap,
  farmerInterests,
  vendorInterests,
  farmingAreas,
  crops,
  animals,
  farmSizes,
  yearsOfExperience,
  certifications,
  vendorBusinessTypes,
  getLGAsForState,
};
