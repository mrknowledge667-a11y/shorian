// Utility script to clear localStorage cache
// Run this in the browser console if translations are not updating

const clearTranslationCache = () => {
  // Clear any cached language data
  localStorage.removeItem('selectedLanguage');
  localStorage.removeItem('translations');
  
  // Set language back to default
  localStorage.setItem('selectedLanguage', 'en');
  
  console.log('Translation cache cleared. Please refresh the page.');
};

clearTranslationCache();