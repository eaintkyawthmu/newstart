import { useEffect, useRef } from 'react';

interface UseAccessibilityProps {
  announcePageChange?: boolean;
  focusOnMount?: boolean;
  trapFocus?: boolean;
}

export const useAccessibility = ({
  announcePageChange = false,
  focusOnMount = false,
  trapFocus = false
}: UseAccessibilityProps = {}) => {
  const containerRef = useRef<HTMLElement>(null);

  // Announce page changes to screen readers
  useEffect(() => {
    if (announcePageChange) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Page content has changed';
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [announcePageChange]);

  // Focus management
  useEffect(() => {
    if (focusOnMount && containerRef.current) {
      const focusableElement = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        focusableElement.focus();
      } else {
        containerRef.current.focus();
      }
    }
  }, [focusOnMount]);

  // Focus trap for modals
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [trapFocus]);

  return { containerRef };
};

export default useAccessibility;