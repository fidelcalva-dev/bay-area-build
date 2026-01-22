import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobileMode() {
  const [isMobile, setIsMobile] = useState(false);
  const [forceMobile, setForceMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('forceMobileMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleForceMobile = () => {
    const newValue = !forceMobile;
    setForceMobile(newValue);
    localStorage.setItem('forceMobileMode', String(newValue));
  };

  // Mobile mode is active if viewport is mobile OR user forced it
  const mobileMode = isMobile || forceMobile;

  return {
    mobileMode,
    isMobile,
    forceMobile,
    toggleForceMobile,
  };
}
