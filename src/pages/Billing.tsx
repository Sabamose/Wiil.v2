import React from "react";
import Navigation from "@/components/Navigation";
import PricingPlans from "@/components/PricingPlans";
import { useIsMobile } from "@/hooks/use-mobile";

const Billing = () => {
  const isMobile = useIsMobile();

  const handlePlanSelect = (planId: string, estimate: any) => {
    console.log("Selected plan:", planId, estimate);
    // Handle plan selection - could integrate with Stripe or other payment provider
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <Navigation />
      
      <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 animate-fade-in`}>
        <header className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-brand-teal">Billing & Plans</h1>
          <div className="h-0.5 w-24 bg-brand-teal/30 rounded-full mt-2" />
          <p className="text-gray-600 mt-4">Choose the perfect plan for your AI assistant needs. Adjust the sliders to estimate your monthly costs.</p>
        </header>

        <section className="rounded-xl border border-brand-teal/20 bg-background shadow-sm p-4 md:p-6">
          <PricingPlans 
            accent="#0d9488"
            onSelect={handlePlanSelect}
          />
        </section>
      </main>
    </div>
  );
};

export default Billing;