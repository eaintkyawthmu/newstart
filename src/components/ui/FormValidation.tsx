import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface FormValidationProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean) => void;
  rules?: ValidationRule[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  realTimeValidation?: boolean;
}

const FormValidation: React.FC<FormValidationProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onValidation,
  rules = [],
  placeholder,
  required = false,
  disabled = false,
  className = '',
  showValidation = true,
  realTimeValidation = true
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;

  // Validate field
  const validateField = (inputValue: string) => {
    const errors: string[] = [];
    
    // Required validation
    if (required && !inputValue.trim()) {
      errors.push(`${label} is required`);
    }
    
    // Custom rules validation
    if (inputValue.trim()) {
      rules.forEach(rule => {
        if (!rule.test(inputValue)) {
          errors.push(rule.message);
        }
      });
    }
    
    setValidationErrors(errors);
    const fieldIsValid = errors.length === 0 && (!required || inputValue.trim());
    setIsValid(fieldIsValid);
    onValidation?.(fieldIsValid);
    
    return fieldIsValid;
  };

  // Real-time validation
  useEffect(() => {
    if (realTimeValidation && hasBeenTouched) {
      validateField(value);
    }
  }, [value, realTimeValidation, hasBeenTouched]);

  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenTouched(true);
    validateField(value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const getFieldClasses = () => {
    let classes = `block w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none min-h-[44px] ${
      type === 'password' ? 'pr-12' : ''
    }`;
    
    if (disabled) {
      classes += ' bg-gray-100 cursor-not-allowed border-gray-200';
    } else if (hasBeenTouched && showValidation) {
      if (validationErrors.length > 0) {
        classes += ' form-field-invalid border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200';
      } else if (value.trim() && isValid) {
        classes += ' form-field-valid border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200';
      } else {
        classes += ' border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
      }
    } else {
      classes += ' border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
    }
    
    return classes;
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={fieldId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getFieldClasses()}
          aria-invalid={validationErrors.length > 0}
          aria-describedby={validationErrors.length > 0 ? `${fieldId}-error` : undefined}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-r-lg"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
        
        {hasBeenTouched && showValidation && value.trim() && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {validationErrors.length > 0 ? (
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
            )}
          </div>
        )}
      </div>
      
      {hasBeenTouched && showValidation && validationErrors.length > 0 && (
        <div 
          id={`${fieldId}-error`}
          className="space-y-1"
          role="alert"
          aria-live="polite"
        >
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center animate-slide-down">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
              {error}
            </p>
          ))}
        </div>
      )}
      
      {hasBeenTouched && showValidation && validationErrors.length === 0 && value.trim() && isValid && (
        <p className="text-sm text-green-600 flex items-center animate-slide-down">
          <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" aria-hidden="true" />
          Looks good!
        </p>
      )}
    </div>
  );
};

export default FormValidation;