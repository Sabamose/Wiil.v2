import { Home, MessageCircle, Bot, BookOpen, Phone, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavItemClass = (path: string) => {
    const isActive = currentPath === path;
    return `flex items-center gap-3 px-6 py-3 transition-all ${
      isActive 
        ? "text-gray-900 bg-gray-100 border-l-3 border-gray-900 font-medium"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;
  };

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-100 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="text-lg font-semibold">Wiil</span>
          <span className="text-xs text-gray-500 font-normal">Preview Version</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="w-5 h-5 text-gray-600">🌙</span>
          <span>Current balance: $3.00</span>
          <span>SM</span>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 py-6 overflow-y-auto">
        <a href="#" className={getNavItemClass("/home")}>
          <Home className="w-5 h-5" />
          Home
        </a>
        <a href="/conversations" className={getNavItemClass("/conversations")}>
          <MessageCircle className="w-5 h-5" />
          Conversations
        </a>
        <a href="/" className={getNavItemClass("/")}>
          <Bot className="w-5 h-5" />
          My Assistants
        </a>
        <a href="#" className={getNavItemClass("/knowledge-base")}>
          <BookOpen className="w-5 h-5" />
          Knowledge Base
        </a>
        
        {/* Separator */}
        <div className="border-t border-gray-200 my-4 mx-6"></div>
        
        <a href="/phone-numbers" className={getNavItemClass("/phone-numbers")}>
          <Phone className="w-5 h-5" />
          Phone Numbers
        </a>
        <a href="/website" className={getNavItemClass("/website")}>
          <Globe className="w-5 h-5" />
          Website
        </a>
      </nav>
    </>
  );
};

export default Navigation;