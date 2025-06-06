import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    // If there's a hash, let the browser handle scrolling to the element
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    
    // Otherwise, scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use instant to avoid motion sickness
    });
  }, [pathname, hash, key]);

  return null;
};