// Comprehensive monitoring and health checks

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  timestamp: string;
}

// Health check for Supabase
export const checkSupabaseHealth = async (): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'supabase',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'supabase',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Health check for Sanity
export const checkSanityHealth = async (): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`https://${import.meta.env.VITE_SANITY_PROJECT_ID}.api.sanity.io/v1/ping`);
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'sanity',
      status: response.ok ? 'healthy' : 'degraded',
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      service: 'sanity',
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Comprehensive health check
export const performHealthCheck = async (): Promise<HealthCheckResult[]> => {
  const checks = await Promise.all([
    checkSupabaseHealth(),
    checkSanityHealth()
  ]);
  
  console.log('Health Check Results:', checks);
  
  // Track unhealthy services
  checks.forEach(check => {
    if (check.status === 'unhealthy') {
      if (window.gtag) {
        window.gtag('event', 'service_unhealthy', {
          service_name: check.service,
          error_message: check.error,
          response_time: check.responseTime
        });
      }
    }
  });
  
  return checks;
};

// Monitor application performance
export const monitorAppPerformance = () => {
  // Monitor memory usage
  const checkMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      const totalMB = memory.totalJSHeapSize / 1048576;
      const limitMB = memory.jsHeapSizeLimit / 1048576;
      
      // Alert if memory usage is high
      if (usedMB > limitMB * 0.8) {
        console.warn('High memory usage detected:', {
          used: `${usedMB.toFixed(2)} MB`,
          total: `${totalMB.toFixed(2)} MB`,
          limit: `${limitMB.toFixed(2)} MB`
        });
        
        if (window.gtag) {
          window.gtag('event', 'high_memory_usage', {
            used_mb: Math.round(usedMB),
            total_mb: Math.round(totalMB),
            limit_mb: Math.round(limitMB)
          });
        }
      }
    }
  };

  // Monitor network conditions
  const monitorNetworkConditions = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      console.log('Network conditions:', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      });
      
      // Adjust app behavior based on connection
      if (connection.saveData || connection.effectiveType === 'slow-2g') {
        document.documentElement.classList.add('low-bandwidth');
        console.log('Low bandwidth detected, optimizing experience');
      }
      
      // Listen for connection changes
      connection.addEventListener('change', () => {
        console.log('Network conditions changed:', connection.effectiveType);
        
        if (window.gtag) {
          window.gtag('event', 'network_change', {
            effective_type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt
          });
        }
      });
    }
  };

  // Monitor page visibility
  const monitorPageVisibility = () => {
    let startTime = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const timeSpent = Date.now() - startTime;
        console.log('Page hidden, time spent:', timeSpent, 'ms');
        
        if (window.gtag) {
          window.gtag('event', 'page_time_spent', {
            time_spent_ms: timeSpent,
            page_path: window.location.pathname
          });
        }
      } else {
        startTime = Date.now();
        console.log('Page visible again');
      }
    });
  };

  // Initialize monitoring
  checkMemoryUsage();
  monitorNetworkConditions();
  monitorPageVisibility();
  
  // Check memory usage every 30 seconds
  setInterval(checkMemoryUsage, 30000);
  
  // Perform health checks every 5 minutes
  setInterval(performHealthCheck, 5 * 60 * 1000);
};

// Initialize monitoring when app starts
export const initMonitoring = () => {
  // Perform initial health check
  performHealthCheck();
  
  // Start performance monitoring
  monitorAppPerformance();
  
  console.log('Application monitoring initialized');
};