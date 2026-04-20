import { useId } from "react";

/**
 * FarmConnect Logo Component - SVG Icon Only
 * ENFORCED: This component ALWAYS renders SVG icon only. Text rendering is permanently disabled.
 */
const FarmConnectLogo = ({ size = 36 }) => {
  const gradientId = useId().replace(/:/g, "");
  const leafGradientId = `farmConnectLeaf-${gradientId}`;
  const soilGradientId = `farmConnectSoil-${gradientId}`;
  const iconSize = Math.round(size * 1.15);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: iconSize,
        height: iconSize,
        flexShrink: 0,
        minWidth: iconSize,
        minHeight: iconSize,
      }}
      role="img"
      aria-label="FarmConnect"
      title="FarmConnect"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          display: "block",
          width: iconSize,
          height: iconSize,
          flexShrink: 0,
        }}
      >
        <defs>
          <linearGradient id={leafGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b7a57" />
            <stop offset="100%" stopColor="#204330" />
          </linearGradient>
          <linearGradient id={soilGradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9a6a3a" />
            <stop offset="100%" stopColor="#6b4423" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="#eef6f1" />
        <path
          d="M13 42c4-6 10-9 19-9s15 3 19 9"
          fill="none"
          stroke={`url(#${soilGradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M32 45V20"
          stroke="#204330"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M32 26c-8 0-12-4-14-11 8 0 12 4 14 11Z"
          fill={`url(#${leafGradientId})`}
        />
        <path
          d="M32 31c8 0 12-4 14-11-8 0-12 4-14 11Z"
          fill={`url(#${leafGradientId})`}
        />
      </svg>
    </div>
  );
};

export default FarmConnectLogo;
