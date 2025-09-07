import { useCallback, useEffect, useRef } from 'react';

interface UseScrollBottomDetectionOptions {
  threshold?: number; // Distance from bottom to trigger callback (in pixels)
  throttleMs?: number; // Throttle interval in milliseconds
  onScrollTouchBottom: () => void;
}

/**
 * Custom hook for detecting when scroll reaches bottom with performance optimization
 * Uses throttling and requestAnimationFrame to minimize INP impact
 */
export const useScrollBottomDetection = (
  scrollElementRef: React.RefObject<HTMLElement | null>,
  options: UseScrollBottomDetectionOptions,
) => {
  const { threshold = 100, throttleMs = 100, onScrollTouchBottom } = options;

  // Use refs to avoid recreating functions on every render
  const lastTriggerTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const isNearBottomRef = useRef<boolean>(false);

  const checkScrollPosition = useCallback(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom <= threshold;

    // Only trigger if we just reached the bottom (not already at bottom)
    if (isNearBottom && !isNearBottomRef.current) {
      const now = Date.now();
      if (now - lastTriggerTimeRef.current >= throttleMs) {
        lastTriggerTimeRef.current = now;
        onScrollTouchBottom();
      }
    }

    isNearBottomRef.current = isNearBottom;
  }, [scrollElementRef, threshold, throttleMs, onScrollTouchBottom]);

  const throttledCheckScrollPosition = useCallback(() => {
    // Cancel previous RAF if it exists
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // Use requestAnimationFrame for smooth performance
    rafIdRef.current = requestAnimationFrame(() => {
      checkScrollPosition();
    });
  }, [checkScrollPosition]);

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    // Add scroll event listener with passive flag for better performance
    element.addEventListener('scroll', throttledCheckScrollPosition, { passive: true });

    return () => {
      element.removeEventListener('scroll', throttledCheckScrollPosition);

      // Clean up RAF on unmount
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [throttledCheckScrollPosition, scrollElementRef]);

  // Reset the near bottom state when data changes
  useEffect(() => {
    isNearBottomRef.current = false;
  }, [scrollElementRef.current?.scrollHeight]);
};
