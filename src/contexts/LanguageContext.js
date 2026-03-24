import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchActiveLanguages } from '../api/content';

const LanguageContext = createContext();

// RTL languages list
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const isRTL = (languageCode) => RTL_LANGUAGES.includes(languageCode);

export const LanguageProvider = ({ children }) => {
  // Initialize with null to indicate loading state
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch languages from database on mount
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await fetchActiveLanguages();
        if (languages && languages.length > 0) {
          // Sort languages to put default first
          const sortedLanguages = [...languages].sort((a, b) => {
            if (a.is_default) return -1;
            if (b.is_default) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          });
          
          setAvailableLanguages(sortedLanguages);
          
          // Find the default language from database
          const defaultLanguage = sortedLanguages.find(lang => lang.is_default);
          const savedLanguage = localStorage.getItem('selectedLanguage');
          const userHasChangedLanguage = localStorage.getItem('userHasChangedLanguage') === 'true';
          
          // Only use saved language if user has explicitly changed it
          let initialLanguage;
          if (userHasChangedLanguage && savedLanguage && sortedLanguages.some(lang => lang.code === savedLanguage)) {
            initialLanguage = savedLanguage;
          } else if (defaultLanguage) {
            // Use database default
            initialLanguage = defaultLanguage.code;
            // Clear any old saved language that wasn't user-selected
            localStorage.removeItem('selectedLanguage');
            localStorage.removeItem('userHasChangedLanguage');
          } else {
            initialLanguage = sortedLanguages[0].code;
          }
          
          setCurrentLanguage(initialLanguage);
          document.documentElement.lang = initialLanguage;
          document.documentElement.dir = isRTL(initialLanguage) ? 'rtl' : 'ltr';
        } else {
          // Fallback if no languages in database - default to Arabic
          const fallbackLanguages = [
            { code: 'ar', name: 'Arabic', native_name: 'العربية', is_default: true },
            { code: 'en', name: 'English', native_name: 'English', is_default: false }
          ];
          setAvailableLanguages(fallbackLanguages);
          setCurrentLanguage('ar');
          localStorage.setItem('selectedLanguage', 'ar');
          document.documentElement.lang = 'ar';
          document.documentElement.dir = 'rtl';
        }
      } catch (error) {
        console.error('Error loading languages:', error);
        // Fallback on error - default to Arabic
        const fallbackLanguages = [
          { code: 'ar', name: 'Arabic', native_name: 'العربية', is_default: true },
          { code: 'en', name: 'English', native_name: 'English', is_default: false }
        ];
        setAvailableLanguages(fallbackLanguages);
        setCurrentLanguage('ar');
        localStorage.setItem('selectedLanguage', 'ar');
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguages();
  }, []);

  const changeLanguage = (languageCode) => {
    if (availableLanguages.some(lang => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('selectedLanguage', languageCode);
      localStorage.setItem('userHasChangedLanguage', 'true'); // Mark that user explicitly changed language
      document.documentElement.lang = languageCode;
      document.documentElement.dir = isRTL(languageCode) ? 'rtl' : 'ltr';
      
      // Clear cache when language changes
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      // Force page reload to ensure fresh content
      window.location.reload();
    }
  };

  const getCurrentLanguageData = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[0];
  };

  const isCurrentRTL = () => isRTL(currentLanguage);

  const value = {
    currentLanguage,
    changeLanguage,
    availableLanguages,
    setAvailableLanguages,
    getCurrentLanguageData,
    isLoading,
    isRTL: isCurrentRTL,
  };

  // Provide context even while loading, with a loading indicator if needed
  return (
    <LanguageContext.Provider value={value}>
      {isLoading || !currentLanguage ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #3B9FD9',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}} />
          </div>
        </div>
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
};