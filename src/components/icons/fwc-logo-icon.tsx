interface FwcLogoIconProps {
  className?: string;
}

export function FwcLogoIcon({ className }: FwcLogoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <rect width="64" height="64" rx="6" fill="white" />

      {/* Trophy cup body */}
      <rect x="16" y="3" width="32" height="19" rx="2" fill="black" />

      {/* Left handle */}
      <path
        d="M16 7 C10 7 8 10 8 12.5 C8 15 10 18 16 18"
        stroke="black"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right handle */}
      <path
        d="M48 7 C54 7 56 10 56 12.5 C56 15 54 18 48 18"
        stroke="black"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Stem */}
      <rect x="28" y="22" width="8" height="8" fill="black" />

      {/* Base */}
      <rect x="20" y="30" width="24" height="5" rx="1.5" fill="black" />

      {/* "26" numerals */}
      <text
        x="32"
        y="60"
        fontFamily="'Arial Black', Impact, 'Franklin Gothic Heavy', sans-serif"
        fontSize="26"
        fontWeight="900"
        fill="black"
        textAnchor="middle"
      >
        26
      </text>
    </svg>
  );
}
