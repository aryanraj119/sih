export const UrjadrishtiLogoIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ujLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="ujGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Eye Outer Contour (Drishti) */}
      <path
        d="M 5 30 Q 30 8 55 30 Q 30 52 5 30 Z"
        stroke="url(#ujLogoGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Pupil & Iris */}
      <circle cx="30" cy="30" r="10" stroke="url(#ujLogoGrad)" strokeWidth="4" fill="none" />
      <circle cx="30" cy="30" r="4" fill="url(#ujLogoGrad)" />

      {/* Energy Wave & Upward Trend Arrow */}
      <path
        d="M 45 35 Q 52 22 58 35 T 70 25 L 90 10"
        stroke="url(#ujLogoGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrowhead */}
      <path
        d="M 76 10 H 90 V 24"
        stroke="url(#ujLogoGrad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Central Lightning Bolt (Urja) */}
      <path
        d="M 46 22 L 40 34 H 47 L 42 46"
        stroke="url(#ujLogoGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="url(#ujLogoGrad)"
      />

      {/* Circuit Nodes */}
      <circle cx="30" cy="8" r="2.5" fill="#06b6d4" />
      <circle cx="30" cy="52" r="2.5" fill="#06b6d4" />
      <circle cx="70" cy="8" r="2.5" fill="#f59e0b" />
      <circle cx="68" cy="52" r="2.5" fill="#10b981" />
    </svg>
  );
};
