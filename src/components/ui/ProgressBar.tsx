import React from 'react';
import { CheckCircle } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  showSteps?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'indigo';
  animated?: boolean;
  showPercentage?: boolean;
  className?: string;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showSteps = false,
  size = 'md',
  color = 'blue',
  animated = true,
  showPercentage = false,
  className = '',
  label
}) => {
  const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600'
  };

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={label}>
      {(showSteps || showPercentage || label) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          <div className="flex items-center space-x-2">
            {showSteps && (
              <span className="text-sm text-gray-600">
                {current} of {total}
              </span>
            )}
            {showPercentage && (
              <span className="text-sm font-medium text-gray-700">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div 
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
      
      {showSteps && total <= 10 && (
        <div className="flex justify-between mt-2">
          {Array.from({ length: total }, (_, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                index < current
                  ? `border-${color}-600 bg-${color}-600 text-white`
                  : `border-gray-300 bg-white text-gray-400`
              }`}
            >
              {index < current ? (
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
              ) : (
                <span className="text-xs font-medium">{index + 1}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;