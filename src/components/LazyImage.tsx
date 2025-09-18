import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { createResponsiveImageProps, handleImageError } from '../utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  responsive?: boolean;
  fallbackSrc?: string;
  quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  onLoad,
  onError,
  responsive = true,
  fallbackSrc,
  quality = 80
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleErrorEvent = () => {
    setHasError(true);
    onError?.();
    
    // Try fallback image if available
    if (fallbackSrc && imgRef.current && imgRef.current.src !== fallbackSrc) {
      imgRef.current.src = fallbackSrc;
      setHasError(false);
    }
  };

  const defaultPlaceholder = (
    <div className={`image-placeholder ${className}`}>
      <ImageIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
    </div>
  );

  if (hasError) {
    return (
      <div className={`image-placeholder ${className}`} role="img" aria-label={alt}>
        <ImageIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
        <span className="sr-only">Failed to load image: {alt}</span>
      </div>
    );
  }

  // Get responsive image props if enabled
  const imageProps = responsive 
    ? createResponsiveImageProps(src, alt, { quality })
    : { src, alt };
  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (placeholder || defaultPlaceholder)}
      
      {isInView && (
        <img
          {...imageProps}
          className={`responsive-image transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleErrorEvent}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;