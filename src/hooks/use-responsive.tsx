import * as React from "react"

// Breakpoints following common device sizes
const MOBILE_BREAKPOINT = 640    // sm in Tailwind
const TABLET_BREAKPOINT = 1024   // lg in Tailwind

export function useResponsive() {
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < MOBILE_BREAKPOINT) {
        setScreenSize('mobile')
      } else if (width < TABLET_BREAKPOINT) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    const mql1 = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const mql2 = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    
    mql1.addEventListener("change", updateScreenSize)
    mql2.addEventListener("change", updateScreenSize)
    updateScreenSize()
    
    return () => {
      mql1.removeEventListener("change", updateScreenSize)
      mql2.removeEventListener("change", updateScreenSize)
    }
  }, [])

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet', 
    isDesktop: screenSize === 'desktop',
    screenSize
  }
}

// Keep the original hook for backwards compatibility
export function useIsMobile() {
  const { isMobile } = useResponsive()
  return isMobile
}
