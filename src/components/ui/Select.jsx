import React from 'react';

export const Select = ({
  value,
  onChange,
  options = [],
  className = '',
  placeholder,
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`form-select ${className}`.trim()}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
