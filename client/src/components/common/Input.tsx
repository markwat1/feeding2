import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  type?: 'text' | 'number' | 'date' | 'time' | 'datetime-local';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  min,
  max,
  step,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`${styles.input} ${className}`}
      min={min}
      max={max}
      step={step}
    />
  );
};