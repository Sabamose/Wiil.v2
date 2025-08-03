import { useState } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";

const Index = () => {
  const [hasExistingAssistants, setHasExistingAssistants] = useState(false); // Demo toggle

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Demo Toggle */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <div className="flex justify-center">
          <div className="flex bg-accent rounded-lg p-1">
            <Button 
              variant={!hasExistingAssistants ? "default" : "ghost"} 
              size="sm"
              onClick={() => setHasExistingAssistants(false)}
            >
              New User Experience
            </Button>
            <Button 
              variant={hasExistingAssistants ? "default" : "ghost"} 
              size="sm"
              onClick={() => setHasExistingAssistants(true)}
            >
              Existing User Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {!hasExistingAssistants ? (
          // New users see the hero section with demo templates
          <HeroSection />
        ) : (
          // Existing users see their assistants with template inspiration
          <ExistingAssistantsSection />
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Wiil AI. Experience working assistants in 10 seconds, create custom assistants in 5 minutes.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
