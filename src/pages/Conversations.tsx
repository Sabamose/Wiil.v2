import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Conversations = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <Navigation />
        <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-6 relative animate-fade-in`}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-brand-teal/30 transition-colors shadow-sm"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-brand-teal mb-2">Conversations</h1>
                <div className="h-1 w-16 bg-brand-teal/30 rounded-full"></div>
              </div>
            </div>
          </div>
          <CallsDashboard />
        </main>
    </div>
  );
};

export default Conversations;