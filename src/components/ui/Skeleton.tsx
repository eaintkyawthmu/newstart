import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
  animated = true
}) => {
  const baseClasses = `bg-gray-200 ${animated ? 'loading-shimmer' : ''} ${className}`;
  
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Loading content">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} h-4`}
            style={{ 
              width: index === lines - 1 ? '75%' : '100%',
              ...style 
            }}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;