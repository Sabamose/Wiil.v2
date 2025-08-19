import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/use-responsive';

interface NavigationState {
  isCollapsed: boolean;
  isPinned: boolean;
  isMobile: boolean;
  isHome: boolean;
}

const STORAGE_KEY = 'navigation-collapsed';

export const useNavigationState = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const isHome = location.pathname === '/';

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (isMobile) return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false; // Default to expanded
    }
  });

  // Calculate if navigation should be collapsed
  const shouldBeCollapsed = !isMobile && isCollapsed;

  const toggleCollapse = useCallback(() => {
    if (isMobile) return; // Can't collapse on mobile
    
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    try {
      localStorage.setItem(STORAGE_KEY, newCollapsed.toString());
    } catch {
      // Ignore storage errors
    }
  }, [isCollapsed, isMobile]);

  // Reset collapse state when going to mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  const navigationState: NavigationState = {
    isCollapsed: shouldBeCollapsed,
    isPinned: false, // No longer needed since we use explicit toggle
    isMobile,
    isHome,
  };

  return {
    ...navigationState,
    toggleCollapse,
  };
};