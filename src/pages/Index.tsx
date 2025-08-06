import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";
import AssistantCreationFlow from "@/components/AssistantCreationFlow";
import RefinedAssistantCreationFlow from "@/components/RefinedAssistantCreationFlow";
import AssistantSettings from "@/components/AssistantSettings";
import VoiceConversationInterface from "@/components/VoiceConversationInterface";
import EnhancedVoiceInterface from "@/components/EnhancedVoiceInterface";
import { BaseAssistant } from "@/types/assistant";
import { useAssistants, StoredAssistant } from "@/hooks/useAssistants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"list" | "settings">("list");
  const { assistants, loading } = useAssistants();

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
            <ExistingAssistantsSection assistants={assistants} loading={loading} />
          </main>
        ) : (
          selectedAssistant && (
            <AssistantSettings 
              assistant={selectedAssistant}
              onBack={handleBackToList}
            />
          )
        )}

        <RefinedAssistantCreationFlow 
          isOpen={isCreationFlowOpen}
          onClose={() => setIsCreationFlowOpen(false)}
          onComplete={(assistantId) => {
            console.log('Assistant created with ID:', assistantId);
            // The useAssistants hook should automatically update the list
          }}
        />
      </div>
  );
};

export default Index;