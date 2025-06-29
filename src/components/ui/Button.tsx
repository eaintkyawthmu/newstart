import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs md:text-sm',
    md: 'px-4 py-2 text-sm md:text-base',
    lg: 'px-5 py-2.5 text-base md:text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 disabled:bg-primary-300 shadow-soft-sm hover:shadow-soft',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-primary-500 disabled:text-gray-300 shadow-soft-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 disabled:text-gray-300',
    danger: 'bg-error-600 text-white hover:bg-error-700 focus-visible:ring-error-500 disabled:bg-error-300 shadow-soft-sm'
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Disabled and loading state
  const isDisabled = disabled || isLoading;
  
  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${widthClasses}
        ${isDisabled ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span className="text-sm md:text-base">{children}</span>
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;