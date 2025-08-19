import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useResponsive } from '@/hooks/use-responsive';

interface NavigationState {
  isCollapsed: boolean;
  isPinned: boolean;
  isMobile: boolean;
  isHovered: boolean;
  isHome: boolean;
}

const STORAGE_KEY = 'navigation-pinned';
const HOVER_DELAY = 300;

export const useNavigationState = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const isHome = location.pathname === '/';

  const [isPinned, setIsPinned] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Calculate if navigation should be collapsed
  const isCollapsed = !isMobile && !isHome && !isPinned && !isHovered;

  const togglePin = useCallback(() => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    try {
      localStorage.setItem(STORAGE_KEY, newPinned.toString());
    } catch {
      // Ignore storage errors
    }
  }, [isPinned]);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    setIsHovered(true);
  }, [hoverTimeoutId]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      setIsHovered(false);
      setHoverTimeoutId(null);
    }, HOVER_DELAY);
    
    setHoverTimeoutId(timeoutId);
  }, [hoverTimeoutId]);

  const handleFocus = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleBlur = useCallback(() => {
    // Small delay to allow focus to move between nav items
    setTimeout(() => {
      const activeElement = document.activeElement;
      const navElement = document.querySelector('[data-navigation]');
      if (!navElement?.contains(activeElement)) {
        setIsHovered(false);
      }
    }, 100);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId);
      }
    };
  }, [hoverTimeoutId]);

  // Reset hover state when route changes (except on home)
  useEffect(() => {
    if (!isHome) {
      setIsHovered(false);
    }
  }, [location.pathname, isHome]);

  const navigationState: NavigationState = {
    isCollapsed,
    isPinned,
    isMobile,
    isHovered,
    isHome,
  };

  return {
    ...navigationState,
    togglePin,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
  };
};