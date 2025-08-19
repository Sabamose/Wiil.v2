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
    if (isMobile || isHome) return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return true; // Default to collapsed on non-home pages
    }
  });

  // Calculate if navigation should be collapsed (no longer uses hover)
  const shouldBeCollapsed = !isMobile && !isHome && isCollapsed;

  const toggleCollapse = useCallback(() => {
    if (isMobile || isHome) return; // Can't collapse on mobile or home
    
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    try {
      localStorage.setItem(STORAGE_KEY, newCollapsed.toString());
    } catch {
      // Ignore storage errors
    }
  }, [isCollapsed, isMobile, isHome]);

  // Reset collapse state when route changes to/from home
  useEffect(() => {
    if (isHome || isMobile) {
      setIsCollapsed(false);
    }
  }, [location.pathname, isHome, isMobile]);

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