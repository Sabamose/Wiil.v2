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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 flex items-center gap-3">
            Saba Moseshvili 
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-xl text-xs font-medium">
              ✓ Live
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-2">Welcome back, Saba! 👋</p>
          <p className="text-sm text-gray-600 mb-4">Manage your existing AI assistants and their configurations</p>
          
          <div className="flex gap-3">
            <button 
              onClick={handleCreateAssistant}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <span>+</span>
              Create Assistant
            </button>
          </div>
        </div>

        <ExistingAssistantsSection />
      </main>
    </div>
  );
};

export default Index;