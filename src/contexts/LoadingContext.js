// src/contexts/LoadingContext.js
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const LoadingContext = createContext();
const LOADING_TIMEOUT = 10000; // 10 seconds timeout

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRefs = useRef({});

  // Update overall loading state when individual states change
  useEffect(() => {
    const hasActiveLoading = Object.values(loadingStates).some(state => state === true);
    setIsLoading(hasActiveLoading);
  }, [loadingStates]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, []);

  const stopLoading = useCallback((key) => {
    // Clear timeout if it exists
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
    setLoading(key, false);
  }, [setLoading]);

  const startLoading = useCallback((key) => {
    setLoading(key, true);
    
    // Set a timeout to automatically stop loading after 10 seconds
    timeoutRefs.current[key] = setTimeout(() => {
      console.warn(`Loading timeout for key: ${key}`);
      stopLoading(key);
    }, LOADING_TIMEOUT);
  }, [setLoading, stopLoading]);

  const value = {
    isLoading,
    startLoading,
    stopLoading,
    setLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};