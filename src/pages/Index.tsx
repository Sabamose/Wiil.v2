import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";
import AssistantCreationFlow from "@/components/AssistantCreationFlow";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);

  useEffect(() => {
    const handleCreateAssistant = () => {
      setIsCreationFlowOpen(true);
    };

    window.addEventListener('create-assistant', handleCreateAssistant);
    
    return () => {
      window.removeEventListener('create-assistant', handleCreateAssistant);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <Navigation />
      
      {/* Main Content */}
      <main className="ml-60 mt-16 p-8">
        <ExistingAssistantsSection />
      </main>

      <AssistantCreationFlow 
        isOpen={isCreationFlowOpen}
        onClose={() => setIsCreationFlowOpen(false)}
      />
    </div>
  );
};

export default Index;