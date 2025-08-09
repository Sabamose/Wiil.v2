import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Conversations = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 to-white">
        <Navigation />
        <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-6 relative animate-fade-in`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-teal mb-2">Conversations</h1>
            <div className="h-1 w-16 bg-brand-teal/30 rounded-full"></div>
          </div>
          <CallsDashboard />
        </main>
    </div>
  );
};

export default Conversations;