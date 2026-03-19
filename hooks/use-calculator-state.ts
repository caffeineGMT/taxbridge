'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for calculator state persistence with localStorage
 * Automatically saves and restores calculator inputs
 */
export function useCalculatorState<T extends Record<string, any>>(
  key: string,
  initialState: T
) {
  const [state, setState] = useState<T>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({ ...initialState, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load calculator state:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isLoaded) return; // Don't save on initial load

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save calculator state:', error);
    }
  }, [key, state, isLoaded]);

  // Clear saved state
  const clearSavedState = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setState(initialState);
    } catch (error) {
      console.error('Failed to clear calculator state:', error);
    }
  }, [key, initialState]);

  // Check if there's saved state
  const hasSavedState = useCallback(() => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  return {
    state,
    setState,
    isLoaded,
    clearSavedState,
    hasSavedState: hasSavedState(),
  };
}
