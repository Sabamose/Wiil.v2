import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";
import { AssistantCreationFlow } from "@/components/AssistantCreationFlow";
import AssistantSettings from "@/components/AssistantSettings";
import { AssistantWithChannels } from "@/types/assistant";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<AssistantWithChannels | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "settings">("list");

  // Sample assistant data with industry and use case
  const assistants: AssistantWithChannels[] = [
    {
      id: "1",
      name: "Customer Support Bot",
      type: "Unified",
      industry: "retail",
      useCase: "customer-support",
      channels: [
        { name: 'Phone calls', connected: true, type: 'phone' },
        { name: 'Website chat', connected: false, type: 'website' }
      ],
      status: 'live',
      phoneNumber: '+1 (555) 123-4567',
      phoneIntegrationStatus: 'purchased'
    },
    {
      id: "2", 
      name: "Sales Assistant",
      type: "Chat",
      industry: "technology",
      useCase: "outbound-sales",
      channels: [
        { name: 'Website chat', connected: true, type: 'website' }
      ],
      status: 'setup'
    },
    {
      id: "3",
      name: "Technical Support",
      type: "Voice",
      industry: "technology",
      useCase: "customer-support",
      channels: [
        { name: 'Phone calls', connected: false, type: 'phone' },
        { name: 'WhatsApp', connected: true, type: 'whatsapp' }
      ],
      status: 'setup'
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