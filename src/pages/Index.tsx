import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";
import AssistantCreationFlow from "@/components/AssistantCreationFlow";
import EnhancedAssistantCreationFlow from "@/components/EnhancedAssistantCreationFlow";
import AssistantSettings from "@/components/AssistantSettings";
import VoiceConversationInterface from "@/components/VoiceConversationInterface";
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
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
        {currentView === "list" && <Navigation />}
        
        {/* Main Content */}
        {currentView === "list" ? (
          <main className="ml-60 mt-16 p-8">
            <Tabs defaultValue="assistants" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="assistants">Assistants</TabsTrigger>
                <TabsTrigger value="voice-chat">Voice Chat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assistants">
                <ExistingAssistantsSection assistants={assistants} loading={loading} />
              </TabsContent>
              
              <TabsContent value="voice-chat">
                <VoiceConversationInterface />
              </TabsContent>
            </Tabs>
          </main>
        ) : (
          selectedAssistant && (
            <AssistantSettings 
              assistant={selectedAssistant}
              onBack={handleBackToList}
            />
          )
        )}

        <EnhancedAssistantCreationFlow 
          isOpen={isCreationFlowOpen}
          onClose={() => setIsCreationFlowOpen(false)}
          onComplete={(assistantId) => {
            const newAssistant = assistants.find(a => a.id === assistantId);
            if (newAssistant) {
              setSelectedAssistant(newAssistant);
              setCurrentView("settings");
            }
          }}
        />
      </div>
    </AuthGuard>
  );
};

export default Index;