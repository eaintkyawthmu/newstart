import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  interactive = false
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 overflow-hidden w-full mb-4 transition-all duration-200';
  const interactiveClasses = interactive ? 'hover:shadow-soft-md cursor-pointer press-effect' : '';
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`p-5 border-b border-gray-200 ${className}`}>{children}</div>;
};

export const CardContent: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`p-5 border-t border-gray-200 ${className}`}>{children}</div>;
};

export default Card;