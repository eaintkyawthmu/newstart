// Browser compatibility utilities and polyfills

// Feature detection utilities
export const browserSupport = {
  intersectionObserver: 'IntersectionObserver' in window,
  webp: false,
  avif: false,
  serviceWorker: 'serviceWorker' in navigator,
  pushNotifications: 'PushManager' in window,
  webShare: 'share' in navigator,
  clipboard: 'clipboard' in navigator,
  geolocation: 'geolocation' in navigator,
  localStorage: (() => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })(),
  sessionStorage: (() => {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  })(),
  indexedDB: 'indexedDB' in window,
  webGL: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  })(),
  touchEvents: 'ontouchstart' in window,
  pointerEvents: 'onpointerdown' in window,
  customElements: 'customElements' in window,
  shadowDOM: 'attachShadow' in Element.prototype,
  cssGrid: CSS.supports('display', 'grid'),
  cssFlexbox: CSS.supports('display', 'flex'),
  cssCustomProperties: CSS.supports('--test', 'test'),
  resizeObserver: 'ResizeObserver' in window,
  performanceObserver: 'PerformanceObserver' in window
};

// Initialize feature detection
export const initFeatureDetection = async () => {
  // Test WebP support
  browserSupport.webp = await testImageFormat('webp');
  
  // Test AVIF support
  browserSupport.avif = await testImageFormat('avif');
  
  console.log('Browser Support:', browserSupport);
  
  // Add classes to document for CSS feature detection
  const documentElement = document.documentElement;
  
  Object.entries(browserSupport).forEach(([feature, supported]) => {
    if (supported) {
      documentElement.classList.add(`supports-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
    } else {
      documentElement.classList.add(`no-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
    }
  });
};

// Test image format support
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

// Polyfills for older browsers
export const loadPolyfills = async () => {
  const polyfillsNeeded = [];

  // IntersectionObserver polyfill
  if (!browserSupport.intersectionObserver) {
    polyfillsNeeded.push(
      import('intersection-observer').catch(() => {
        console.warn('Failed to load IntersectionObserver polyfill');
      })
    );
  }

  // ResizeObserver polyfill
  if (!browserSupport.resizeObserver) {
    polyfillsNeeded.push(
      import('@juggle/resize-observer').then((module) => {
        window.ResizeObserver = module.ResizeObserver;
      }).catch(() => {
        console.warn('Failed to load ResizeObserver polyfill');
      })
    );
  }

  // Web Share API fallback
  if (!browserSupport.webShare) {
    window.navigator.share = async (data: ShareData) => {
      // Fallback implementation
      if (browserSupport.clipboard && data.url) {
        await navigator.clipboard.writeText(data.url);
        return Promise.resolve();
      }
      return Promise.reject(new Error('Web Share not supported'));
    };
  }

  await Promise.all(polyfillsNeeded);
};

// Browser-specific optimizations
export const applyBrowserOptimizations = () => {
  // Safari-specific optimizations
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    // Fix Safari's 100vh issue
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
  }

  // iOS-specific optimizations
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    // Prevent zoom on input focus
    const addViewportMeta = () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    };

    // Only prevent zoom on form inputs
    document.addEventListener('focusin', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        addViewportMeta();
      }
    });

    document.addEventListener('focusout', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0'
        );
      }
    });
  }

  // Chrome-specific optimizations
  if (/Chrome/.test(navigator.userAgent)) {
    // Enable hardware acceleration for animations
    document.documentElement.style.transform = 'translateZ(0)';
  }
};

// Performance monitoring for different browsers
export const monitorBrowserPerformance = () => {
  // Track browser-specific performance issues
  const userAgent = navigator.userAgent;
  let browserName = 'unknown';
  
  if (userAgent.includes('Chrome')) browserName = 'chrome';
  else if (userAgent.includes('Firefox')) browserName = 'firefox';
  else if (userAgent.includes('Safari')) browserName = 'safari';
  else if (userAgent.includes('Edge')) browserName = 'edge';

  // Monitor long tasks (performance issues)
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('Long task detected:', entry.duration, 'ms');
            
            if (window.gtag) {
              window.gtag('event', 'long_task', {
                duration: Math.round(entry.duration),
                browser: browserName,
                custom_parameter: 'performance_monitoring'
              });
            }
          }
        });
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.error('Long task monitoring setup failed:', error);
    }
  }
};

// Initialize all browser compatibility features
export const initBrowserCompatibility = async () => {
  await initFeatureDetection();
  await loadPolyfills();
  applyBrowserOptimizations();
  monitorBrowserPerformance();
  
  console.log('Browser compatibility initialized');
};