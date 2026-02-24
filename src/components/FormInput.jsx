import React from 'react';
import './FormInput.css';

/**
 * Reusable form input component with built-in error handling
 * Works with useForm hook for easy integration
 */
const FormInput = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  isTouched,
  required = false,
  disabled = false,
  helperText,
  ...restProps
}) => {
  const hasError = isTouched && error;

  return (
    <div className="form-input-wrapper">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`form-input ${hasError ? 'form-input--error' : ''}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        {...restProps}
      />
      {hasError && (
        <span id={`${name}-error`} className="form-error">
          {error}
        </span>
      )}
      {helperText && !hasError && (
        <span id={`${name}-helper`} className="form-helper">
          {helperText}
        </span>
      )}
    </div>
  );
};

export default FormInput;
