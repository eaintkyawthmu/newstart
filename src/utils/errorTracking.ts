// Comprehensive error tracking and monitoring

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  buildVersion: string;
}

// Generate session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('error_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('error_session_id', sessionId);
  }
  return sessionId;
};

// Track JavaScript errors
export const initErrorTracking = () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    const errorDetails: ErrorDetails = {
      message: event.message,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    };

    trackError('javascript_error', errorDetails);
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const errorDetails: ErrorDetails = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    };

    trackError('unhandled_promise_rejection', errorDetails);
  });

  // React Error Boundary errors
  window.addEventListener('error-boundary-triggered', (event: any) => {
    const errorDetails: ErrorDetails = {
      message: event.detail.error,
      stack: event.detail.stack,
      componentStack: event.detail.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    };

    trackError('react_error_boundary', errorDetails);
  });

  // Network errors
  window.addEventListener('online', () => {
    console.log('Network connection restored');
    trackError('network_restored', {
      message: 'Network connection restored',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    });
  });

  window.addEventListener('offline', () => {
    console.log('Network connection lost');
    trackError('network_lost', {
      message: 'Network connection lost',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    });
  });
};

// Track errors to analytics and logging service
const trackError = async (errorType: string, errorDetails: ErrorDetails) => {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${errorType}]`, errorDetails);
    }

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: errorDetails.message,
        fatal: errorType === 'javascript_error',
        custom_parameter_1: errorType,
        custom_parameter_2: errorDetails.sessionId
      });
    }

    // Send to Supabase for logging (if available)
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track_error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          error_type: errorType,
          error_details: errorDetails
        })
      }).catch((err) => {
        console.error('Failed to send error to logging service:', err);
      });
    }

    // Store in localStorage as backup
    const storedErrors = JSON.parse(localStorage.getItem('error_log') || '[]');
    storedErrors.push({ errorType, errorDetails });
    
    // Keep only last 10 errors
    if (storedErrors.length > 10) {
      storedErrors.shift();
    }
    
    localStorage.setItem('error_log', JSON.stringify(storedErrors));

  } catch (trackingError) {
    console.error('Error tracking failed:', trackingError);
  }
};

// Manual error tracking for custom errors
export const trackCustomError = (message: string, context?: Record<string, any>) => {
  const errorDetails: ErrorDetails = {
    message,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
    ...context
  };

  trackError('custom_error', errorDetails);
};

// Network error tracking
export const trackNetworkError = (url: string, status: number, statusText: string) => {
  const errorDetails: ErrorDetails = {
    message: `Network error: ${status} ${statusText}`,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
  };

  trackError('network_error', errorDetails);
};

// Performance issue tracking
export const trackPerformanceIssue = (metric: string, value: number, threshold: number) => {
  if (value > threshold) {
    const errorDetails: ErrorDetails = {
      message: `Performance issue: ${metric} exceeded threshold (${value}ms > ${threshold}ms)`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      buildVersion: import.meta.env.VITE_APP_VERSION || 'unknown'
    };

    trackError('performance_issue', errorDetails);
  }
};

// Get error logs for debugging
export const getErrorLogs = (): any[] => {
  return JSON.parse(localStorage.getItem('error_log') || '[]');
};

// Clear error logs
export const clearErrorLogs = () => {
  localStorage.removeItem('error_log');
};