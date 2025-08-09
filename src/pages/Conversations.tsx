import Navigation from "@/components/Navigation";
import CallsDashboard from "@/components/CallsDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Conversations = () => {
  const isMobile = useIsMobile();
  
  return (
    <div>
        <Navigation />
        <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-6 relative animate-fade-in bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_23px,rgba(0,0,0,0)_23px),linear-gradient(to_right,hsl(var(--brand-teal)/0.06)_1px,transparent_1px)] bg-[size:100%_24px,24px_100%]`}>
          <header className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-brand-teal">Conversations</h1>
            <div className="h-0.5 w-24 bg-brand-teal/30 rounded-full mt-2" />
          </header>
          <section className="rounded-xl border border-brand-teal/20 bg-background shadow-sm">
            <div className="p-2 md:p-4">
              <CallsDashboard />
            </div>
          </section>
        </main>
    </div>
  );
};

export default Conversations;