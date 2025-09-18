import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  type,
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon = true
}) => {
  const typeConfig = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      icon: AlertCircle
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      icon: Info
    }
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <div 
      className={`
        rounded-lg border p-4 animate-slide-down
        ${config.bgColor} ${config.borderColor} ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        {icon && (
          <div className="flex-shrink-0">
            <IconComponent 
              className={`h-5 w-5 ${config.iconColor}`} 
              aria-hidden="true" 
            />
          </div>
        )}
        
        <div className={`${icon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${config.textColor} hover:bg-opacity-20 focus:ring-offset-${type === 'warning' ? 'yellow' : type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'}-50
              `}
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;