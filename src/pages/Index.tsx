import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";
import AssistantCreationFlow from "@/components/AssistantCreationFlow";
import AssistantSettings from "@/components/AssistantSettings";
import { BaseAssistant } from "@/types/assistant";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<BaseAssistant | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "settings">("list");

  // Sample assistant data with industry and use case
  const assistants: BaseAssistant[] = [
    {
      id: "1",
      name: "CustomerSupport",
      type: "Unified",
      industry: "retail",
      useCase: "customer-support",
      assistantType: "inbound",
      phoneNumber: "+1 (555) 123-4567"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      type: "Chat",
      industry: "technology",
      useCase: "outbound-sales",
      assistantType: "outbound",
      phoneNumber: "+1 (555) 234-5678"
    },
    {
      id: "3",
      name: "Technical Support",
      type: "Voice",
      industry: "technology",
      useCase: "customer-support",
      assistantType: "inbound",
      phoneNumber: "+1 (555) 345-6789"
    }
  ];

  useEffect(() => {
    const handleCreateAssistant = () => {
      setIsCreationFlowOpen(true);
    };

    const handleViewAssistantSettings = (event: CustomEvent) => {
      const assistantId = event.detail.assistantId;
      const assistant = assistants.find(a => a.id === assistantId);
      if (assistant) {
        setSelectedAssistant(assistant);
        setCurrentView("settings");
      }
    };

    window.addEventListener('create-assistant', handleCreateAssistant);
    window.addEventListener('view-assistant-settings', handleViewAssistantSettings as EventListener);
    
    return () => {
      window.removeEventListener('create-assistant', handleCreateAssistant);
      window.removeEventListener('view-assistant-settings', handleViewAssistantSettings as EventListener);
    };
  }, [assistants]);

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedAssistant(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {currentView === "list" && <Navigation />}
      
      {/* Main Content */}
      {currentView === "list" ? (
        <main className="ml-60 mt-16 p-8">
          <ExistingAssistantsSection assistants={assistants} />
        </main>
      ) : (
        selectedAssistant && (
          <AssistantSettings 
            assistant={selectedAssistant}
            onBack={handleBackToList}
          />
        )
      )}

      <AssistantCreationFlow 
        isOpen={isCreationFlowOpen}
        onClose={() => setIsCreationFlowOpen(false)}
      />
    </div>
  );
};

export default Index;