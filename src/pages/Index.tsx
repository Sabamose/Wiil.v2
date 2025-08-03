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
      useCase: "customer-support"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      type: "Chat",
      industry: "technology",
      useCase: "outbound-sales"
    },
    {
      id: "3",
      name: "Technical Support",
      type: "Voice",
      industry: "technology",
      useCase: "customer-support"
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
          {/* Try Assistant Section */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground">Try Our Assistant</h2>
                    <p className="text-muted-foreground">Experience AI assistants in action before creating your own</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Customer Support Demo</h3>
                    <p className="text-sm text-muted-foreground mb-3">Try our customer service assistant</p>
                    <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                      Call Now: +1 (555) 123-4567
                    </button>
                  </div>
                  
                  <div className="p-4 bg-accent/50 rounded-lg">
                    <h3 className="font-medium text-foreground mb-2">Sales Assistant Demo</h3>
                    <p className="text-sm text-muted-foreground mb-3">Experience our sales qualification bot</p>
                    <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                      Call Now: +1 (555) 234-5678
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Analytics Panel */}
            <div className="space-y-4">
              <div className="bg-card rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-foreground mb-3">Live Analytics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Calls</span>
                    <span className="font-medium text-foreground">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Today's Conversations</span>
                    <span className="font-medium text-foreground">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Response Time</span>
                    <span className="font-medium text-foreground">0.8s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border shadow-sm p-4">
                <h3 className="font-semibold text-foreground mb-3">Recent Activity</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Call completed - Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">Lead qualified - Sales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Issue resolved - Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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