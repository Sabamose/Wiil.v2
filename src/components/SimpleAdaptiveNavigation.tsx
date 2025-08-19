import React from 'react';
import { Home } from "lucide-react";

const SimpleAdaptiveNavigation: React.FC = () => {
  console.log('SimpleAdaptiveNavigation: Basic component rendering');
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 md:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
          W
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold">Wiil</span>
          <span className="text-xs text-muted-foreground font-normal">Preview Version</span>
        </div>
      </div>
      <Home className="w-5 h-5" />
    </header>
  );
};

export default SimpleAdaptiveNavigation;