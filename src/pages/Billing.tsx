import React from "react";
import AdaptiveNavigation from "@/components/AdaptiveNavigation";
import PricingPlans from "@/components/PricingPlans";
import { useResponsive } from "@/hooks/use-responsive";
import { useNavigationState } from "@/hooks/useNavigationState";

const Billing = () => {
  const { isMobile } = useResponsive();
  const { isCollapsed, isHome } = useNavigationState();

  const handlePlanSelect = (planId: string, estimate: any) => {
    console.log("Selected plan:", planId, estimate);
    // Handle plan selection - could integrate with Stripe or other payment provider
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white">
      <AdaptiveNavigation />
      
      <main className={`transition-all duration-200 ease-in-out ${
        isMobile ? 'ml-0' : (isHome ? 'ml-60' : (isCollapsed ? 'ml-20' : 'ml-60'))
      } mt-16 p-4 md:p-8 animate-fade-in`}>
        <header className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-teal mb-2">Pricing Plans</h1>
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