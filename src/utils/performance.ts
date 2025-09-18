// Performance monitoring and optimization utilities

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

// Performance observer for Core Web Vitals
export const initPerformanceMonitoring = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') return;

  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Track LCP metric
        trackPerformanceMetric('largest_contentful_paint', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          trackPerformanceMetric('first_input_delay', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        console.log('CLS:', clsValue);
        trackPerformanceMetric('cumulative_layout_shift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.error('Performance monitoring setup failed:', error);
    }
  }

  // Track page load metrics
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      };

      // Get paint metrics
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = entry.startTime;
        }
      });

      console.log('Performance Metrics:', metrics);
      trackPerformanceMetrics(metrics);
    }, 0);
  });
};

// Track performance metrics
const trackPerformanceMetric = (metricName: string, value: number) => {
  // Send to analytics service
  if (window.gtag) {
    window.gtag('event', 'performance_metric', {
      metric_name: metricName,
      metric_value: Math.round(value),
      custom_parameter: 'core_web_vitals'
    });
  }
};

const trackPerformanceMetrics = (metrics: PerformanceMetrics) => {
  // Send comprehensive metrics
  if (window.gtag) {
    window.gtag('event', 'page_performance', {
      load_time: Math.round(metrics.loadTime),
      dom_content_loaded: Math.round(metrics.domContentLoaded),
      first_contentful_paint: Math.round(metrics.firstContentfulPaint)
    });
  }
};

// Resource loading optimization
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/icons/logomain-trans.svg',
    '/icons/newstart-logotext.svg'
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.svg') ? 'image' : 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
};

// Bundle size monitoring
export const trackBundleSize = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalJSSize = 0;
    let totalCSSSize = 0;
    
    resources.forEach((resource) => {
      if (resource.name.includes('.js')) {
        totalJSSize += resource.transferSize || 0;
      } else if (resource.name.includes('.css')) {
        totalCSSSize += resource.transferSize || 0;
      }
    });

    console.log('Bundle Sizes:', {
      javascript: `${(totalJSSize / 1024).toFixed(2)} KB`,
      css: `${(totalCSSSize / 1024).toFixed(2)} KB`,
      total: `${((totalJSSize + totalCSSSize) / 1024).toFixed(2)} KB`
    });

    // Track bundle size metrics
    if (window.gtag) {
      window.gtag('event', 'bundle_size', {
        javascript_size: Math.round(totalJSSize / 1024),
        css_size: Math.round(totalCSSSize / 1024),
        total_size: Math.round((totalJSSize + totalCSSSize) / 1024)
      });
    }
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });

    // Track memory usage
    if (window.gtag) {
      window.gtag('event', 'memory_usage', {
        used_mb: Math.round(memory.usedJSHeapSize / 1048576),
        total_mb: Math.round(memory.totalJSHeapSize / 1048576)
      });
    }
  }
};

// Initialize all performance monitoring
export const initPerformanceOptimizations = () => {
  initPerformanceMonitoring();
  preloadCriticalResources();
  trackBundleSize();
  
  // Monitor memory usage every 30 seconds
  setInterval(monitorMemoryUsage, 30000);
};