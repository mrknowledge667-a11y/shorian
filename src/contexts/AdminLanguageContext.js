import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminLanguageContext = createContext();

export const useAdminLanguage = () => {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    throw new Error('useAdminLanguage must be used within AdminLanguageProvider');
  }
  return context;
};

export const AdminLanguageProvider = ({ children }) => {
  const [adminLanguage, setAdminLanguage] = useState(() => {
    // Get saved language from localStorage
    return localStorage.getItem('adminEditingLanguage') || 'en';
  });

  const changeAdminLanguage = (language) => {
    setAdminLanguage(language);
    localStorage.setItem('adminEditingLanguage', language);
    
    // Clear cache when language changes
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Trigger a custom event for components to refresh
    window.dispatchEvent(new CustomEvent('adminLanguageChanged', { detail: { language } }));
  };

  useEffect(() => {
    // Listen for language changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'adminEditingLanguage' && e.newValue) {
        setAdminLanguage(e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    adminLanguage,
    changeAdminLanguage,
  };

  return (
    <AdminLanguageContext.Provider value={value}>
      {children}
    </AdminLanguageContext.Provider>
  );
};

export default AdminLanguageContext;