import AdaptiveNavigation from "@/components/AdaptiveNavigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useResponsive } from "@/hooks/use-responsive";
import { useNavigationState } from "@/hooks/useNavigationState";
import { useChatLayout } from "@/hooks/useChatLayout";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Conversations = () => {
  const { isMobile } = useResponsive();
  const { isCollapsed, isHome } = useNavigationState();
  const { marginLeft } = useChatLayout();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
        <AdaptiveNavigation />
        <main className={`transition-all duration-200 ease-in-out mt-16 p-4 md:p-8 relative animate-fade-in bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_100%]`}
              style={{ marginLeft: `${marginLeft}px` }}>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-brand-teal mb-2">My Assistants</h1>
            <div className="h-1 w-16 bg-brand-teal/30 rounded-full"></div>
          </div>
          <CallsDashboard />
        </main>
    </div>
  );
};

export default Conversations;