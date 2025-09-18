import { supabase } from '../lib/supabaseClient';
import { trackCustomError } from './errorTracking';

interface EventProperties {
  [key: string]: any;
}

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Track an event
export const trackEvent = async (
  eventName: string,
  properties: EventProperties = {}
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Track anonymous events with session ID
      const sessionId = sessionStorage.getItem('analytics_session_id') || getSessionId();
      console.log(`Anonymous event tracked: ${eventName}`, properties);
      return;
    }

    // Add common properties
    const eventProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown',
      device_memory: (navigator as any).deviceMemory || 'unknown',
      hardware_concurrency: navigator.hardwareConcurrency || 'unknown'
    };

    // Send the event to Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_name: eventName,
        properties: eventProperties,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        ip_address: null, // IP will be captured server-side
      });

    if (error) {
      trackCustomError('Failed to track analytics event', { eventName, error: error.message });
    }

    console.log(`Event tracked: ${eventName}`, properties);
  } catch (error) {
    console.error('Error tracking event:', error);
    trackCustomError('Analytics tracking failed', { eventName, error: error.message });
  }
};

// Common event tracking functions
export const trackPageView = (pageName: string, additionalProperties: EventProperties = {}) => {
  trackEvent('page_view', { page_name: pageName, ...additionalProperties });
};

export const trackButtonClick = (buttonName: string, additionalProperties: EventProperties = {}) => {
  trackEvent('button_click', { button_name: buttonName, ...additionalProperties });
};

export const trackFeatureUsage = (featureName: string, additionalProperties: EventProperties = {}) => {
  trackEvent('feature_used', { feature_name: featureName, ...additionalProperties });
};

export const trackLessonCompleted = (lessonId: string, lessonName: string, timeSpentSeconds: number) => {
  trackEvent('lesson_completed', { 
    lesson_id: lessonId, 
    lesson_name: lessonName, 
    time_spent_seconds: timeSpentSeconds 
  });
};

export const trackCourseStarted = (courseId: string, courseName: string) => {
  trackEvent('course_started', { course_id: courseId, course_name: courseName });
};

export const trackCourseCompleted = (courseId: string, courseName: string, totalTimeSpentSeconds: number) => {
  trackEvent('course_completed', { 
    course_id: courseId, 
    course_name: courseName, 
    total_time_spent_seconds: totalTimeSpentSeconds 
  });
};

export const trackSubscriptionStarted = (tier: string, price: number, interval: 'monthly' | 'yearly' | 'lifetime') => {
  trackEvent('subscription_started', { tier, price, interval });
};

export const trackSubscriptionCanceled = (tier: string, reason?: string) => {
  trackEvent('subscription_canceled', { tier, reason });
};

export const trackError = (errorType: string, errorMessage: string, errorContext?: EventProperties) => {
  trackEvent('error_occurred', { error_type: errorType, error_message: errorMessage, ...errorContext });
};

export const trackChatMessage = (message: string, role: 'user' | 'assistant', threadId?: string) => {
  trackEvent('chat_message', { 
    message_content: message, 
    message_role: role, 
    thread_id: threadId,
    message_length: message.length 
  });
};

// Update user's last active timestamp
export const updateUserActivity = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);
  } catch (error) {
    console.error('Error updating user activity:', error);
  }
};

// Initialize analytics
export const initAnalytics = (): void => {
  // Track page view on initial load
  trackPageView(window.location.pathname);
  
  // Update user activity
  updateUserActivity();
  
  // Set up interval to update user activity periodically (every 5 minutes)
  setInterval(updateUserActivity, 5 * 60 * 1000);
};