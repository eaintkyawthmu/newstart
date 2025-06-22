import { useEffect } from 'react';
import { 
  trackEvent,
  trackPageView,
  trackLessonCompleted,
  trackCourseStarted,
  trackFeatureUsage,
  trackChatMessage
} from '../utils/analytics';

export const useAnalytics = () => {
  return {
    trackEvent,
    trackPageView,
    trackLessonCompleted,
    trackCourseStarted,
    trackPremiumFeatureUsed: trackFeatureUsage,
    trackChatMessage,
  };
};

// Hook to automatically track page views
export const usePageTracking = (pageName: string, additionalProperties?: Record<string, any>) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName, additionalProperties);
  }, [pageName, trackPageView]);
};