/**
 * Centralized Theme Configuration
 * Defines all brand colors, typography, and spacing
 * Used across the entire application for consistency
 */

export const theme = {
  colors: {
    // Primary Colors (Green - Main brand color)
    primary: {
      50: "#ebf2ee",
      100: "#c2d6cb",
      200: "#a5c2b2",
      300: "#7ca68e",
      400: "#629579",
      500: "#3b7a57",
      600: "#366f4f",
      700: "#2a573e",
      800: "#204330",
      900: "#193325", // Dark green - primary action color
    },

    // Secondary Colors (Brown/Tan)
    secondary: {
      50: "#f2edea",
      100: "#d6c8be",
      200: "#c3ae9e",
      300: "#a78972",
      400: "#967256",
      500: "#7c4f2c",
      600: "#714828",
      700: "#58381f",
      800: "#442b18",
      900: "#342112",
    },

    // Status Colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",

    // Neutral Colors
    neutral: {
      white: "#ffffff",
      black: "#000000",
      50: "#fefefe",
      100: "#fafafa",
      200: "#f8f8f8",
      300: "#f5f5f5",
      400: "#f3f3f3",
      500: "#e0e0e0",
      600: "#bdbdbd",
      700: "#757575",
      800: "#424242",
      900: "#212121",
    },

    // Text Colors
    text: {
      primary: "#193325",
      secondary: "#666666",
      tertiary: "#999999",
      light: "#ffffff",
    },

    // Background Colors
    background: {
      primary: "#ffffff",
      secondary: "#f8f8f8",
      tertiary: "#f0f0f0",
      dark: "#193325",
    },

    // Border Colors
    border: {
      light: "#e0e0e0",
      medium: "#bdbdbd",
      dark: "#757575",
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '"Inter", sans-serif',
      secondary: '"Roboto", sans-serif',
    },
    fontSizes: {
      xxl: "120px",
      xxl2: "48px",
      xl: "45px",
      lg: "40px",
      md: "36px",
      md2: "32px",
      md3: "28px",
      sm: "22px",
      base: "16px",
      small: "14px",
      xs: "12px",
    },
    fontWeights: {
      thin: 100,
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // Spacing
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    xxl: "32px",
    "3xl": "48px",
  },

  // Border Radius
  borderRadius: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  // Shadows
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },

  // Breakpoints
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

/**
 * Get color helper function
 * Usage: getColor('primary', 900) => '#193325'
 */
export const getColor = (colorGroup, level) => {
  if (typeof level === "undefined") {
    return theme.colors[colorGroup];
  }
  return theme.colors[colorGroup]?.[level] || theme.colors.neutral.white;
};

/**
 * Role-based configuration
 * Defines navigation, colors, and features for each user role
 */
export const roleConfig = {
  farmer: {
    label: "Farmer",
    icon: "farmer",
    color: theme.colors.primary[900],
    description: "Grow crops or raise animals",
    menuItems: [
      { label: "Home", icon: "home", route: "/farmer-dashboard" },
      { label: "Profile", icon: "user", route: "/profile" },
      { label: "Matches", icon: "handshake", route: "/matches" },
      { label: "Messages", icon: "message", route: "/messages" },
      { label: "Marketplace", icon: "shopping", route: "/marketplace" },
      { label: "My Listing", icon: "package", route: "/my-listing" },
      { label: "Subscription", icon: "creditCard", route: "/subscription" },
      { label: "Settings", icon: "settings", route: "/settings" },
    ],
  },

  vendor: {
    label: "Vendor",
    icon: "vendor",
    color: theme.colors.secondary[900],
    description: "Provide agricultural services or products",
    menuItems: [
      { label: "Home", icon: "home", route: "/vendor-dashboard" },
      { label: "Profile", icon: "user", route: "/profile" },
      { label: "Customers", icon: "users", route: "/customers" },
      { label: "Messages", icon: "message", route: "/messages" },
      { label: "Marketplace", icon: "shopping", route: "/marketplace" },
      { label: "My Listing", icon: "package", route: "/my-listing" },
      { label: "Subscription", icon: "creditCard", route: "/subscription" },
      { label: "Analytics", icon: "barChart", route: "/analytics" },
      { label: "Settings", icon: "settings", route: "/settings" },
    ],
  },

  admin: {
    label: "Administrator",
    icon: "shield",
    color: theme.colors.primary[900],
    description: "System administration",
    menuItems: [
      { label: "Dashboard", icon: "dashboard", route: "/admin/dashboard" },
      { label: "Users", icon: "users", route: "/admin/users" },
      { label: "Payments", icon: "creditCard", route: "/admin/payments" },
      { label: "Messages", icon: "flag", route: "/admin/messages" },
      {
        label: "Subscriptions",
        icon: "package",
        route: "/admin/subscriptions",
      },
      { label: "Violations", icon: "alert", route: "/admin/violations" },
      { label: "Settings", icon: "settings", route: "/settings" },
    ],
  },
};

export default theme;
