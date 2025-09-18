// Image optimization and lazy loading utilities

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  sizes?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
}

// Generate optimized image URLs (for services like Cloudinary, ImageKit, etc.)
export const getOptimizedImageUrl = (
  originalUrl: string, 
  width: number, 
  height?: number, 
  options: ImageOptimizationOptions = {}
): string => {
  // If it's a Pexels image, add size parameters
  if (originalUrl.includes('pexels.com')) {
    const url = new URL(originalUrl);
    url.searchParams.set('auto', 'compress');
    url.searchParams.set('cs', 'tinysrgb');
    url.searchParams.set('w', width.toString());
    if (height) {
      url.searchParams.set('h', height.toString());
    }
    url.searchParams.set('dpr', '2');
    return url.toString();
  }

  // For other images, return as-is (could be extended for other services)
  return originalUrl;
};

// Generate responsive image srcSet
export const generateSrcSet = (baseUrl: string, sizes: number[]): string => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, size)} ${size}w`)
    .join(', ');
};

// Create responsive image props
export const createResponsiveImageProps = (
  src: string,
  alt: string,
  options: ImageOptimizationOptions & { 
    breakpoints?: { mobile: number; tablet: number; desktop: number } 
  } = {}
) => {
  const { 
    breakpoints = { mobile: 400, tablet: 768, desktop: 1200 },
    loading = 'lazy',
    ...imageOptions 
  } = options;

  const sizes = Object.values(breakpoints);
  const srcSet = generateSrcSet(src, sizes);
  
  return {
    src: getOptimizedImageUrl(src, breakpoints.desktop, undefined, imageOptions),
    srcSet,
    sizes: `(max-width: 768px) ${breakpoints.mobile}px, (max-width: 1200px) ${breakpoints.tablet}px, ${breakpoints.desktop}px`,
    alt,
    loading,
    decoding: 'async' as const,
    style: { contentVisibility: 'auto' } // CSS containment for performance
  };
};

// Lazy loading with intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target as HTMLImageElement);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    const srcSet = img.dataset.srcset;
    
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
    
    if (srcSet) {
      img.srcset = srcSet;
      img.removeAttribute('data-srcset');
    }
    
    img.classList.remove('lazy');
    img.classList.add('loaded');
    
    if (this.observer) {
      this.observer.unobserve(img);
    }
    this.images.delete(img);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Global lazy image loader instance
export const lazyImageLoader = new LazyImageLoader();

// Preload critical images
export const preloadCriticalImages = (imageUrls: string[]) => {
  imageUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Image format detection and fallback
export const getOptimalImageFormat = async (): Promise<'avif' | 'webp' | 'jpg'> => {
  // Test AVIF support
  if (await testImageFormat('avif')) {
    return 'avif';
  }
  
  // Test WebP support
  if (await testImageFormat('webp')) {
    return 'webp';
  }
  
  // Fallback to JPEG
  return 'jpg';
};

const testImageFormat = (format: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    const testImages = {
      webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    };
    
    img.src = testImages[format as keyof typeof testImages];
  });
};

// Progressive image loading
export const createProgressiveImage = (
  lowQualityUrl: string,
  highQualityUrl: string,
  alt: string
): HTMLImageElement => {
  const img = document.createElement('img');
  img.alt = alt;
  img.className = 'progressive-image';
  
  // Load low quality first
  img.src = lowQualityUrl;
  img.style.filter = 'blur(5px)';
  img.style.transition = 'filter 0.3s ease';
  
  // Load high quality in background
  const highQualityImg = new Image();
  highQualityImg.onload = () => {
    img.src = highQualityUrl;
    img.style.filter = 'none';
  };
  highQualityImg.src = highQualityUrl;
  
  return img;
};

// Image error handling
export const handleImageError = (img: HTMLImageElement, fallbackUrl?: string) => {
  img.onerror = () => {
    if (fallbackUrl && img.src !== fallbackUrl) {
      img.src = fallbackUrl;
    } else {
      // Show placeholder
      img.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder bg-gray-200 flex items-center justify-center';
      placeholder.innerHTML = `
        <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      `;
      img.parentNode?.insertBefore(placeholder, img);
    }
  };
};