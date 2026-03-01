/**
 * Nigerian Geographic and Agricultural Data
 * Contains state-LGA mappings and comprehensive agriculture value chain data
 */

export const nigerianStates = [
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

/**
 * State-LGA mapping for Nigeria
 * Maps each state to its local government areas
 */
export const stateLGAMap = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Mkad",
    "Obingwa",
    "Ohafia",
    "Osisioma Ngwa",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
  ],
  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],
  Akwa: [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono Ibom",
    "Ika",
    "Ikk",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat Enin",
    "Nsit Atai",
    "Nsit Ibom",
    "Nsit Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Ukanafun",
    "Udung Uko",
    "Urue Offong Oruko",
    "Uruan",
    "Uyo",
  ],
  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],
  // Add more states...
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Bariga",
    "Ebutte-Meta",
    "Epe",
    "Eyitala",
    "Fade-Ilupeju",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikoyi",
    "Ikotun-Igando",
    "Ilasamaja",
    "Isolo",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Lekki",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Somolu",
    "Surulere",
    "Yaba",
  ],
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
  return stateLGAMap[state] || [];
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
