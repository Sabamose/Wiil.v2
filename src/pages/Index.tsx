import Navigation from "@/components/Navigation";
import ExistingAssistantsSection from "@/components/ExistingAssistantsSection";

const Index = () => {
  const handleCreateAssistant = () => {
    alert('🎯 Opening assistant creation...\n\nThis would navigate to template selection or creation flow.');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <Navigation />
      
      {/* Main Content */}
      <main className="ml-60 mt-16 p-8">

        <ExistingAssistantsSection />
      </main>
    </div>
  );
};

export default Index;