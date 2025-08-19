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
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";
import HomePageTealV2 from "./components/HomePageTealV2";
import AnalyticsDemo from "./pages/AnalyticsDemo";
import WorkspaceSetup from "./pages/WorkspaceSetup";
import WorkspaceGuard from "./components/WorkspaceGuard";
import { ChatProvider } from "./contexts/ChatContext";
import HorizontalChatPanel from "./components/HorizontalChatPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ChatProvider>
        <AuthWrapper>
          <BrowserRouter>
            <WorkspaceGuard>
              <HorizontalChatPanel />
              <Routes>
              <Route path="/home" element={<HomePageTealV2 />} />
              <Route path="/workspace-setup" element={<WorkspaceSetup />} />
              <Route path="/" element={<Index />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/phone-numbers" element={<PhoneNumbers />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/analytics" element={<AnalyticsDemo />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </WorkspaceGuard>
          </BrowserRouter>
        </AuthWrapper>
      </ChatProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
