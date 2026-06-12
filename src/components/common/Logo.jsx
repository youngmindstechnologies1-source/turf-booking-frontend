import React from 'react';

const Logo = ({ className = '', size = 28, style = {} }) => {
  return (
    <img
      src="/images/logo.png"
      alt="PitchPe"
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        borderRadius: '6px',
        display: 'block',
        flexShrink: 0,
        ...style
      }}
    />
  );
};

export default Logo;
