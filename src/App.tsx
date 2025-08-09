import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthWrapper from "./components/AuthWrapper";
import Index from "./pages/Index";
import PhoneNumbers from "./pages/PhoneNumbers";
import Bookings from "./pages/Bookings";
import Conversations from "./pages/Conversations";
import Campaigns from "./pages/Campaigns";
import NotFound from "./pages/NotFound";
import HomePageTealV2 from "./components/HomePageTealV2";
import AnalyticsDemo from "./pages/AnalyticsDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<HomePageTealV2 />} />
            <Route path="/" element={<Index />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/phone-numbers" element={<PhoneNumbers />} />
            <Route path="/analytics" element={<AnalyticsDemo />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthWrapper>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
