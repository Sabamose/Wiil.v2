import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useResponsive } from "@/hooks/use-responsive";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Conversations = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <Navigation />
        <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-6 relative animate-fade-in bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_100%]`}>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-brand-teal mb-2">Conversations</h1>
            <div className="h-1 w-16 bg-brand-teal/30 rounded-full"></div>
          </div>
          <CallsDashboard />
        </main>
    </div>
  );
};

export default Conversations;