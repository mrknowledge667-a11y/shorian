import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Trigger re-render and animation on route change
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="page-transition-wrapper" key={location.pathname}>
      {children}
    </div>
  );
};

export default PageTransition;