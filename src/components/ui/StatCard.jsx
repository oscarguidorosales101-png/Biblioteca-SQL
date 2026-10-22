import React from 'react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  color = 'red',
  className = ''
}) => {
  return (
    <div className={`stat-card ${className}`.trim()}>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className={`stat-icon ${color}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};
