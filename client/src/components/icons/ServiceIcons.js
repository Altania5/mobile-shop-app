import React from 'react';

const commonSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 64 64',
  role: 'img',
  'aria-hidden': 'true',
};

const strokeStyle = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const ExpertRepairsIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="repairBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>
      <linearGradient id="repairAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#repairBase)" />
    <path
      d="M22 20l6 6M36 34l6 6M28 26l-6 6m24-18l-6 6m-8 8l10 10 6-6-10-10"
      stroke="url(#repairAccent)"
      strokeWidth="3"
      style={strokeStyle}
    />
    <path d="M22 44l8-8" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const MobileServiceIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="vanBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="vanAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#vanBase)" />
    <rect x="18" y="28" width="24" height="12" rx="4" stroke="url(#vanAccent)" strokeWidth="3" style={strokeStyle} />
    <path d="M42 28h6l4 6v6h-6" stroke="url(#vanAccent)" strokeWidth="3" style={strokeStyle} />
    <circle cx="26" cy="44" r="4" fill="#38bdf8" />
    <circle cx="40" cy="44" r="4" fill="#38bdf8" />
    <path d="M22 24h10" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const FastResponseIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="fastBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#111827" />
      </linearGradient>
      <linearGradient id="fastAccent" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#fastBase)" />
    <path d="M24 44l8-16h-8l8-16" stroke="url(#fastAccent)" strokeWidth="4" style={strokeStyle} />
    <path d="M40 24c4 4 4 12 0 16" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    <path d="M44 20c6 6 6 18 0 24" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
  </svg>
);

export const MobileConvenienceIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="mobileBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="mobileAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#mobileBase)" />
    <path
      d="M32 48c-6-8-12-14-12-22a12 12 0 1124 0c0 8-6 14-12 22z"
      stroke="url(#mobileAccent)"
      strokeWidth="3"
      style={strokeStyle}
    />
    <circle cx="32" cy="26" r="5" fill="#22d3ee" />
  </svg>
);

export const ExpertTechniciansIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="techBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="techAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#techBase)" />
    <circle cx="32" cy="24" r="8" stroke="url(#techAccent)" strokeWidth="3" style={strokeStyle} />
    <path
      d="M20 46c2-7 6-12 12-12s10 5 12 12"
      stroke="url(#techAccent)"
      strokeWidth="3"
      style={strokeStyle}
    />
    <path d="M40 20l4-4m-20 4l-4-4" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const QualityGuaranteedIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="qualityBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="qualityAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#fb7185" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#qualityBase)" />
    <path
      d="M32 50c-8-4-14-10-14-18V20l14-6 14 6v12c0 8-6 14-14 18z"
      stroke="url(#qualityAccent)"
      strokeWidth="3"
      style={strokeStyle}
    />
    <path d="M26 32l4 4 8-8" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FlexibleSchedulingIcon = (props) => (
  <svg {...commonSvgProps} {...props}>
    <defs>
      <linearGradient id="scheduleBase" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="scheduleAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="url(#scheduleBase)" />
    <rect x="18" y="22" width="28" height="22" rx="4" stroke="url(#scheduleAccent)" strokeWidth="3" style={strokeStyle} />
    <path d="M18 30h28" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
    <circle cx="28" cy="38" r="3" fill="#22d3ee" />
    <path d="M34 36l8 8" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default {
  ExpertRepairsIcon,
  MobileServiceIcon,
  FastResponseIcon,
  MobileConvenienceIcon,
  ExpertTechniciansIcon,
  QualityGuaranteedIcon,
  FlexibleSchedulingIcon,
};
