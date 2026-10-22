import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }}
        />
      )}
      {children}
    </span>
  );
};
