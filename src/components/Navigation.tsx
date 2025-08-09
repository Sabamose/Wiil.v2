import { Home, MessageCircle, Bot, Phone, Globe, Calendar, Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const getNavItemClass = (path: string) => {
    const isActive = currentPath === path;
    return `flex items-center gap-3 px-6 py-3 transition-all relative ${
      isActive 
        ? "text-brand-teal bg-brand-teal/5 font-medium before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-brand-teal before:rounded-r-full"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  const navigationItems = [
    { href: "#", path: "/home", icon: Home, label: "Home" },
    { href: "/conversations", path: "/conversations", icon: MessageCircle, label: "Conversations" },
    { href: "/", path: "/", icon: Bot, label: "My Assistants" },
    { href: "/bookings", path: "/bookings", icon: Calendar, label: "Bookings" },
    { href: "/phone-numbers", path: "/phone-numbers", icon: Phone, label: "Phone Numbers" },
  ];

  const NavigationContent = () => (
    <>
      {navigationItems.slice(0, 4).map((item) => (
        <a key={item.path} href={item.href} className={getNavItemClass(item.path)} onClick={() => setIsOpen(false)}>
          <item.icon className="w-5 h-5" />
          {item.label}
        </a>
      ))}
      
      {/* Separator */}
      <div className="border-t border-teal-100 my-4 mx-6"></div>
      
      <a href="/phone-numbers" className={getNavItemClass("/phone-numbers")} onClick={() => setIsOpen(false)}>
        <Phone className="w-5 h-5" />
        Phone Numbers
      </a>
    </>
  );

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-teal-100/50 px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="mr-2">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0">
                <div className="py-6">
                  <NavigationContent />
                </div>
              </SheetContent>
            </Sheet>
          )}
          <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="text-lg font-semibold">Wiil</span>
          <span className="hidden sm:inline text-xs text-gray-500 font-normal">Preview Version</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-sm text-gray-600">
          <span className="w-5 h-5 text-gray-600">🌙</span>
          <span className="hidden sm:inline">Current balance: $3.00</span>
          <span className="sm:hidden">$3.00</span>
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      {!isMobile && (
        <nav className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r border-teal-100/30 py-6 overflow-y-auto">
          <NavigationContent />
        </nav>
      )}
    </>
  );
};

export default Navigation;