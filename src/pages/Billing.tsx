import React from "react";
import Navigation from "@/components/Navigation";
import PricingPlans from "@/components/PricingPlans";
import { useResponsive } from "@/hooks/use-responsive";

const Billing = () => {
  const { isMobile } = useResponsive();

  const handlePlanSelect = (planId: string, estimate: any) => {
    console.log("Selected plan:", planId, estimate);
    // Handle plan selection - could integrate with Stripe or other payment provider
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <Navigation />
      
      <main className={`${isMobile ? 'ml-0' : 'ml-60'} mt-16 p-4 md:p-8 animate-fade-in`}>
        <header className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-teal mb-2">Pricing Plans</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose the perfect plan for your AI assistant needs. Adjust the sliders to estimate your monthly costs.</p>
        </header>

        <PricingPlans 
          accent="#0d9488"
          onSelect={handlePlanSelect}
        />
      </main>
    </div>
  );
};

export default Billing;