import { Home, MessageCircle, Bot, Phone, Calendar, CreditCard, Menu, ChevronLeft, ChevronRight, Moon, Inbox } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigationState } from "@/hooks/useNavigationState";
import { NavigationTooltip } from "@/components/NavigationTooltip";
import { useChatContext } from "@/contexts/ChatContext";

const navigationItems = [
  {
    href: "/home",
    path: "/home",
    icon: Home,
    label: "Home"
  },
  {
    href: "/conversations", 
    path: "/conversations",
    icon: MessageCircle,
    label: "Conversations"
  },
  {
    href: "/inbox",
    path: "/inbox", 
    icon: Inbox,
    label: "Inbox"
  },
  {
    href: "/",
    path: "/",
    icon: Bot,
    label: "My Assistants"
  },
  {
    href: "/bookings",
    path: "/bookings", 
    icon: Calendar,
    label: "Bookings"
  },
  {
    href: "/phone-numbers",
    path: "/phone-numbers",
    icon: Phone,
    label: "Phone Numbers"
  },
  {
    href: "/billing",
    path: "/billing",
    icon: CreditCard,
    label: "Billing"
  }
];

const AdaptiveNavigation = () => {
  const {
    isCollapsed,
    isMobile,
    isHome,
    toggleCollapse,
  } = useNavigationState();
  
  const { isOpen: isChatOpen } = useChatContext();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSheetOpen) {
        setIsSheetOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSheetOpen]);

  const getNavItemClass = (path: string) => {
    const currentPath = window.location.pathname;
    const isActive = currentPath === path;
    
    if (isCollapsed) {
      return `flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
        reducedMotion ? '' : 'duration-200'
      } ${
        isActive 
          ? "text-teal-600 bg-accent border-l-2 border-teal-600" 
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`;
    }
    
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      reducedMotion ? '' : 'duration-200'
    } ${
      isActive 
        ? "text-teal-600 bg-accent border-l-2 border-teal-600 font-medium" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;
  };

  const NavigationContent = () => (
    <div className="flex flex-col h-full">
      {/* Collapse Toggle - Show on all non-mobile pages */}
      {!isMobile && (
        <div className="pb-4 border-b border-border/50">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={toggleCollapse}
            className={`${isCollapsed ? 'w-12 h-8 mx-auto' : 'w-full justify-start h-8'} transition-colors ${
              reducedMotion ? '' : 'duration-200'
            } hover:bg-accent`}
            aria-label={isCollapsed ? "Expand Navigation" : "Collapse Navigation"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      {/* Main Navigation Items */}
      <div className="flex-1 space-y-1 pt-4">{navigationItems.slice(0, 5).map((item) => (
          <NavigationTooltip
            key={item.path}
            content={item.label}
            show={isCollapsed && !isMobile}
          >
            <Link
              to={item.href}
              className={getNavItemClass(item.path)}
              onClick={() => setIsSheetOpen(false)}
              aria-label={item.label}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || isMobile) && <span>{item.label}</span>}
            </Link>
          </NavigationTooltip>
        ))}
        
        {/* Separator */}
        {(!isCollapsed || isMobile) && (
          <div className="border-t border-border my-4"></div>
        )}
        
        <NavigationTooltip
          content="Phone Numbers"
          show={isCollapsed && !isMobile}
        >
          <Link
            to="/phone-numbers"
            className={getNavItemClass("/phone-numbers")}
            onClick={() => setIsSheetOpen(false)}
            aria-label="Phone Numbers"
          >
            <Phone className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>Phone Numbers</span>}
          </Link>
        </NavigationTooltip>
      </div>

      {/* Bottom Section */}
      <div className="space-y-1 mt-auto pt-4">
        {/* Billing */}
        <NavigationTooltip
          content="Billing"
          show={isCollapsed && !isMobile}
        >
          <Link
            to="/billing"
            className={getNavItemClass("/billing")}
            onClick={() => setIsSheetOpen(false)}
            aria-label="Billing"
          >
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || isMobile) && <span>Billing</span>}
          </Link>
        </NavigationTooltip>
      </div>
    </div>
  );

  return (
    <>
      {/* Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-teal-600/10 via-background/95 to-background/95 backdrop-blur-sm border-b border-teal-200/20 px-4 md:px-6 h-16 flex items-center justify-between"
        role="banner"
      >
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="mr-2" aria-label="Open navigation menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-60 p-0 bg-gradient-to-b from-teal-600/5 via-background to-background"
                aria-label="Navigation menu"
              >
                <div className="py-6 px-4 h-full">
                  <NavigationContent />
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Wiil</span>
              <span className="text-xs text-muted-foreground font-normal">Preview Version</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 text-sm">
          <Moon className="w-5 h-5 text-muted-foreground" />
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-sm font-medium">D</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Desktop Navigation */}
      {!isMobile && (
        <nav
          data-navigation
          className={`fixed top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-teal-600/5 via-background/95 to-background/95 backdrop-blur-sm border-r border-teal-200/20 py-6 px-4 z-40 transition-all ${
            reducedMotion ? '' : 'duration-200 ease-in-out'
          } ${
            isCollapsed ? 'w-20' : 'w-60'
          } ${
            isHome ? '' : (isCollapsed ? 'shadow-lg' : 'shadow-lg')
          }`}
          style={{ left: isChatOpen ? '384px' : '0px' }}
          role="navigation"
          aria-label="Main navigation"
        >
          <NavigationContent />
        </nav>
      )}
    </>
  );
};

export default AdaptiveNavigation;