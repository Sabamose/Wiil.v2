import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, BarChart3, MessageCircle, Bot, BookOpen } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="text-xl font-bold text-foreground">Wiil AI</div>
            
            {/* Primary Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button variant="ghost" className="text-foreground">
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                Conversations
              </Button>
            </div>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">Sign In</Button>
            <Button variant="default" size="sm">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;