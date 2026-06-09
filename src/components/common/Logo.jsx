import React from 'react';

const Logo = ({ className = '', size = 28, style = {} }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="logo-accent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer stadium outline / Shield */}
      <path
        d="M16 2L4 7v9c0 5.5 5.1 10.7 12 13 6.9-2.3 12-7.5 12-13V7L16 2z"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      
      {/* Running Track / Inner Stadium lanes */}
      <path
        d="M16 5.5L7.5 9.2v6.8c0 3.7 3.5 7.3 8.5 9.1 5-1.8 8.5-5.4 8.5-9.1V9.2L16 5.5z"
        stroke="url(#logo-accent)"
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      
      {/* Center T-Pitch Logo */}
      {/* Crossbar of T representing a net or pitch line */}
      <path
        d="M10 13h12"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Vertical stem of T representing center line */}
      <path
        d="M16 13v10"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Center Circle for booking/pitch center mark */}
      <circle
        cx="16"
        cy="18"
        r="3.5"
        stroke="url(#logo-accent)"
        strokeWidth="1.5"
        fill="var(--color-bg-primary, #0F172A)"
      />
      
      {/* Small glowing sports ball / slot selected */}
      <circle
        cx="16"
        cy="18"
        r="1.5"
        fill="#34D399"
        filter="url(#logo-glow)"
      />
    </svg>
  );
};

export default Logo;
