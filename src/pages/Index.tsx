import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";
import AssistantCreationFlow from "@/components/AssistantCreationFlow";
import RefinedAssistantCreationFlow from "@/components/RefinedAssistantCreationFlow";
import AssistantSettings from "@/components/AssistantSettings";
import { BaseAssistant } from "@/types/assistant";
import { useAssistants, StoredAssistant } from "@/hooks/useAssistants";
import { useResponsive } from "@/hooks/use-responsive";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<any>(null);
  const [currentView, setCurrentView] = useState<"list" | "settings">("list");
  const { assistants, loading, fetchAssistants } = useAssistants();
  const { isMobile } = useResponsive();

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
        {currentView === "list" && <Navigation />}
        
        {/* Main Content */}
        {currentView === "list" ? (
          <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 relative animate-fade-in bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_100%]`}>
            <header className="mb-6 md:mb-8">
              <h1 className="text-2xl font-semibold text-brand-teal">My Assistants</h1>
              <div className="h-0.5 w-24 bg-brand-teal/30 rounded-full mt-2" />
            </header>
            <div className="mb-4">
              <button 
                onClick={() => setIsCreationFlowOpen(true)} 
                className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                + Create Assistant
              </button>
            </div>
            <section className="rounded-xl border border-brand-teal/20 bg-background shadow-sm hover:bg-teal-50 transition-colors">
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