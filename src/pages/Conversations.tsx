import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Conversations = () => {
  const isMobile = useIsMobile();
  
  return (
    <div>
        <Navigation />
        <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-6 relative animate-fade-in bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_23px,rgba(0,0,0,0)_23px),linear-gradient(to_right,hsl(var(--brand-teal)/0.06)_1px,transparent_1px)] bg-[size:100%_24px,24px_100%]`}>
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