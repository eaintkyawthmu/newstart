import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  clickable = false,
  onClick,
  role,
  ariaLabel
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const baseClasses = `bg-white rounded-lg ${border ? 'border border-gray-200' : ''} ${shadowClasses[shadow]} ${paddingClasses[padding]}`;
  
  const interactiveClasses = clickable || onClick 
    ? 'cursor-pointer transition-all duration-200 hover-lift press-effect focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
    : '';
    
  const hoverClasses = hover && !clickable ? 'hover:shadow-md transition-shadow duration-200' : '';

  const Component = clickable || onClick ? 'button' : 'div';

  return (
    <Component
      className={`${baseClasses} ${interactiveClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
      tabIndex={clickable || onClick ? 0 : undefined}
    >
      {children}
    </Component>
  );
};

export default Card;