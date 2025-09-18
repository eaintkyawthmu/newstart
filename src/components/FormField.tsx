import React, { ReactNode, useState } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface FormFieldProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  success?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  helpText?: string;
  className?: string;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  success,
  placeholder,
  required = false,
  disabled = false,
  icon,
  helpText,
  className = '',
  autoComplete,
  maxLength,
  minLength,
  pattern
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const getFieldClasses = () => {
    let classes = `block w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-0 min-h-[44px] ${
      icon ? 'pl-10' : ''
    } ${type === 'password' ? 'pr-10' : ''}`;
    
    if (error) {
      classes += ' form-field-error';
    } else if (success) {
      classes += ' form-field-success';
    } else {
      classes += ' border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    }
    
    if (disabled) {
      classes += ' bg-gray-100 cursor-not-allowed';
    }
    
    return classes;
  };

  return (
    <div className={`form-group ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        )}
        
        <input
          id={fieldId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={getFieldClasses()}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center focus-ring rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div id={errorId} className="mt-2 flex items-center text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      
      {success && !error && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}
      
      {helpText && !error && (
        <p id={helpId} className="mt-2 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;