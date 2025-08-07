import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Conversations = () => {
  const isMobile = useIsMobile();
  
  return (
    <div>
        <Navigation />
        <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-6`}>
          <CallsDashboard />
      </main>
    </div>
  );
};

export default Conversations;