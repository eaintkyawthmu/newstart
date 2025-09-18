// Code splitting utilities for better performance

import { lazy, ComponentType } from 'react';

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense 
      fallback={
        fallback ? (
          <fallback />
        ) : (
          <div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading component">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden="true"></div>
            <span className="sr-only">Loading...</span>
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Preload components for better UX
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const componentImport = importFunc();
  return componentImport;
};

// Route-based code splitting
export const createLazyRoute = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(() => 
    importFunc().catch((error) => {
      console.error('Failed to load route component:', error);
      // Return a fallback component
      return {
        default: () => (
          <div className="text-center py-12" role="alert">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Page</h2>
            <p className="text-gray-600 mb-4">There was an error loading this page. Please try refreshing.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )
      };
    })
  );
};

// Dynamic imports for heavy libraries
export const loadChartLibrary = () => {
  return import('recharts').catch((error) => {
    console.error('Failed to load chart library:', error);
    return null;
  });
};

export const loadMarkdownLibrary = () => {
  return import('react-markdown').catch((error) => {
    console.error('Failed to load markdown library:', error);
    return null;
  });
};

// Component preloading based on user interaction
export const preloadOnHover = (importFunc: () => Promise<any>) => {
  let preloaded = false;
  
  return {
    onMouseEnter: () => {
      if (!preloaded) {
        preloaded = true;
        importFunc().catch((error) => {
          console.error('Preload failed:', error);
          preloaded = false; // Allow retry
        });
      }
    }
  };
};

// Intersection observer for component preloading
export const preloadOnVisible = (
  element: HTMLElement,
  importFunc: () => Promise<any>
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          importFunc().catch((error) => {
            console.error('Preload on visible failed:', error);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(element);
  return () => observer.disconnect();
};