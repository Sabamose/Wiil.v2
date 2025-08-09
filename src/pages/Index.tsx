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
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"list" | "settings">("list");
  const { assistants, loading, fetchAssistants } = useAssistants();
  const isMobile = useIsMobile();

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
    <div className="min-h-screen bg-white">
        {currentView === "list" && <Navigation />}
        
        {/* Main Content */}
        {currentView === "list" ? (
          <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 relative animate-fade-in bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_23px,rgba(0,0,0,0)_23px),linear-gradient(to_right,hsl(var(--brand-teal)/0.06)_1px,transparent_1px)] bg-[size:100%_24px,24px_100%]`}>
            <header className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-brand-teal">My Assistants</h1>
              <div className="h-0.5 w-24 bg-brand-teal/30 rounded-full mt-2" />
            </header>
            <section className="rounded-xl border border-brand-teal/20 bg-background shadow-sm">
              <div className="p-2 md:p-4">
                <ExistingAssistantsSection assistants={assistants} loading={loading} onRefresh={fetchAssistants} />
              </div>
            </section>
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
          onComplete={async (assistantId) => {
            console.log('Assistant created with ID:', assistantId);
            await fetchAssistants();
            setIsCreationFlowOpen(false);
          }}
        />
      </div>
  );
};

export default Index;