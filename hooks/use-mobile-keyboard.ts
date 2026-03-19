'use client';

import { useEffect, useState } from 'react';

/**
 * Mobile keyboard visibility hook
 * Detects when virtual keyboard is open on iOS/Android
 *
 * Usage:
 * const isKeyboardVisible = useKeyboardVisible();
 *
 * Returns: boolean - true if keyboard is visible
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Visual Viewport API - most accurate for keyboard detection
    const visualViewport = window.visualViewport;

    if (!visualViewport) {
      // Fallback: use resize detection
      const handleResize = () => {
        // Keyboard is likely visible if window.innerHeight is significantly smaller than usual
        const isSmaller = window.innerHeight < window.screen.height * 0.7;
        setIsKeyboardVisible(isSmaller);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }

    // Modern browsers: use Visual Viewport API
    const handleViewportResize = () => {
      // Keyboard is visible when viewport height is smaller than window height
      const keyboardOpen = visualViewport.height < window.innerHeight;
      setIsKeyboardVisible(keyboardOpen);
    };

    visualViewport.addEventListener('resize', handleViewportResize);
    visualViewport.addEventListener('scroll', handleViewportResize);

    return () => {
      visualViewport.removeEventListener('resize', handleViewportResize);
      visualViewport.removeEventListener('scroll', handleViewportResize);
    };
  }, []);

  return isKeyboardVisible;
}

/**
 * Auto-scroll to focused input when keyboard appears
 * Prevents inputs from being hidden behind keyboard on iOS Safari
 *
 * Usage:
 * useAutoScrollOnFocus();
 */
export function useAutoScrollOnFocus() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      // Only handle input elements
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        // Delay to ensure keyboard is fully shown
        setTimeout(() => {
          // Scroll with extra padding to ensure visibility
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });

          // Additional offset for iOS Safari (keyboard covers ~40% of viewport)
          if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            window.scrollBy({
              top: -80,
              behavior: 'smooth',
            });
          }
        }, 300);
      }
    };

    // Use capture phase to handle focus before other handlers
    document.addEventListener('focus', handleFocus, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
    };
  }, []);
}

/**
 * Detect mobile device
 *
 * Returns: { isMobile, isIOS, isAndroid }
 */
export function useMobileDetect() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    setDeviceInfo({
      isMobile,
      isIOS,
      isAndroid,
      isTouchDevice,
    });
  }, []);

  return deviceInfo;
}
