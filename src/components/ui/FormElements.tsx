import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

// Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const id = props.id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="form-label text-sm md:text-base mb-1 block font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            className={`
              form-input text-sm md:text-base
              block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        
        {error && (
          <div className="mt-1 flex items-center text-xs md:text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

// Select Component
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    const id = props.id || `select-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="form-label text-sm md:text-base mb-1 block font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={id}
          className={`
            form-select text-sm md:text-base
            block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <div className="mt-1 flex items-center text-xs md:text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

// Textarea Component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const id = props.id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="form-group">
        {label && (
          <label htmlFor={id} className="form-label text-sm md:text-base mb-1 block font-medium text-gray-700">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={id}
          className={`
            form-input text-sm md:text-base
            block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <div className="mt-1 flex items-center text-xs md:text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

// Checkbox Component
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const id = props.id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
      <div className="form-group">
        <div className="flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={`form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${className}`}
            {...props}
          />
          <label htmlFor={id} className="ml-2 text-sm md:text-base text-gray-700">
            {label}
          </label>
        </div>
        
        {error && (
          <div className="mt-1 flex items-center text-xs md:text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);