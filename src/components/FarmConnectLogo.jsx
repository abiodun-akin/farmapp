import React from "react";

const FarmConnectLogo = ({ size = 36, showText = true }) => {
  const iconSize = Math.round(size * 1.15);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="farmConnectLeaf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b7a57" />
            <stop offset="100%" stopColor="#204330" />
          </linearGradient>
          <linearGradient id="farmConnectSoil" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a6a3a" />
            <stop offset="100%" stopColor="#6b4423" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="#eef6f1" />
        <path d="M13 42c4-6 10-9 19-9s15 3 19 9" fill="none" stroke="url(#farmConnectSoil)" strokeWidth="4" strokeLinecap="round" />
        <path d="M32 45V20" stroke="#204330" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 26c-8 0-12-4-14-11 8 0 12 4 14 11Z" fill="url(#farmConnectLeaf)" />
        <path d="M32 31c8 0 12-4 14-11-8 0-12 4-14 11Z" fill="url(#farmConnectLeaf)" />
        <circle cx="32" cy="45" r="2" fill="#204330" />
      </svg>

      {showText && (
        <span
          style={{
            fontSize: `${Math.max(16, Math.round(size * 0.55))}px`,
            fontWeight: 700,
            color: "var(--color-pry-800)",
            letterSpacing: "0.2px",
            lineHeight: 1,
          }}
        >
          FarmConnect
        </span>
      )}
    </span>
  );
};

export default FarmConnectLogo;
