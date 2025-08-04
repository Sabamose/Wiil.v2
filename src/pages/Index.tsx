import { useState } from "react";
import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import CallDetails from "@/components/CallDetails";
import AssistantCreationFlow from "@/components/AssistantCreationFlow";
import { InboundCall } from "@/types/call";

const Index = () => {
  const [isCreationFlowOpen, setIsCreationFlowOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<InboundCall | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "call-details">("dashboard");

  const handleCallSelect = (call: InboundCall) => {
    setSelectedCall(call);
    setCurrentView("call-details");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedCall(null);
  };

  const handleCreateAssistant = () => {
    setIsCreationFlowOpen(true);
  };

  // Listen for create assistant events
  window.addEventListener('create-assistant', handleCreateAssistant);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {currentView === "dashboard" && <Navigation />}
      
      {/* Main Content */}
      {currentView === "dashboard" ? (
        <main className="ml-60 mt-16 p-8">
          <CallsDashboard onCallSelect={handleCallSelect} />
        </main>
      ) : (
        selectedCall && (
          <CallDetails 
            call={selectedCall}
            onBack={handleBackToDashboard}
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