export default function CardStack({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Stack of task cards"
    >
      {/* back card */}
      <g transform="rotate(-8 200 180)">
        <rect x="70" y="60" width="220" height="130" rx="14" fill="#1c1f26" stroke="#2a2e38" strokeWidth="1.5" />
        <rect x="92" y="84" width="100" height="10" rx="5" fill="#2a2e38" />
        <rect x="92" y="104" width="150" height="8" rx="4" fill="#2a2e38" />
      </g>

      {/* middle card */}
      <g transform="rotate(4 200 200)">
        <rect x="60" y="110" width="240" height="140" rx="14" fill="#22252e" stroke="#2a2e38" strokeWidth="1.5" />
        <rect x="84" y="136" width="70" height="18" rx="9" fill="#ffb454" opacity="0.18" />
        <rect x="92" y="141" width="54" height="8" rx="4" fill="#ffb454" />
        <rect x="84" y="170" width="160" height="9" rx="4.5" fill="#3a3f4b" />
        <rect x="84" y="188" width="120" height="9" rx="4.5" fill="#3a3f4b" />
        <circle cx="262" cy="222" r="12" fill="#6c63ff" />
        <circle cx="240" cy="222" r="12" fill="#857dff" opacity="0.85" />
      </g>

      {/* front card */}
      <g transform="rotate(-3 200 250)">
        <rect x="80" y="170" width="230" height="150" rx="16" fill="#1c1f26" stroke="#2a2e38" strokeWidth="1.5" />
        <rect x="104" y="196" width="56" height="56" rx="12" fill="#6c63ff" opacity="0.15" />
        <path d="M122 224l8 8 16-16" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="176" y="200" width="110" height="10" rx="5" fill="#eef0f3" opacity="0.92" />
        <rect x="176" y="220" width="80" height="8" rx="4" fill="#5b6170" />
        <rect x="104" y="270" width="64" height="22" rx="11" fill="#34d399" opacity="0.16" />
        <rect x="116" y="278" width="40" height="6" rx="3" fill="#34d399" />
        <rect x="178" y="270" width="64" height="22" rx="11" fill="#3a3f4b" />
        <rect x="190" y="278" width="40" height="6" rx="3" fill="#9097a6" />
      </g>
    </svg>
  );
}
