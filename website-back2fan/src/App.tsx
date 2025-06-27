import React from 'react';
import './i18n';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { StakingProvider } from "./hooks/useStaking";
import Layout from "./components/Layout";
import PublicPageLayout from "./components/PublicPageLayout";
import DashboardPage from "./pages/DashboardPage";
import StakingPage from "./pages/StakingPage";
import FanTokensPage from "./pages/FanTokensPage";
import PartnersPage from "./pages/PartnersPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import UserRegistrationModal from "./components/UserRegistrationModal";
import DevelopmentModal from "./components/DevelopmentModal";
import { useStaking } from "./hooks/useStaking";

import { WagmiProvider } from 'wagmi';
import { wagmiConfig, projectId, networks, wagmiAdapter } from './reownConfig';

// Initialize AppKit *outside* React rendering
import { createAppKit } from '@reown/appkit/react';

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: networks[0],
  metadata: {
    name: 'Fan Rewards',
    description: 'Stake Fan Tokens and Earn Cashback',
    url: window.location.origin,
    icons: [],
  },
  features: {
    email: false,
    socials: [],
    emailShowWallets: false,
  },
  
});

const queryClient = new QueryClient();

const AppContent = () => {
  const { needsRegistration, completeRegistration } = useStaking();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        {/* Novas Rotas Públicas */}
        <Route element={<PublicPageLayout />}>
          <Route path="/public/tokens" element={<FanTokensPage />} />
          <Route path="/public/partners" element={<PartnersPage />} />
        </Route>
        {/* Rotas Protegidas */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/staking" element={<StakingPage />} />
          <Route path="/tokens" element={<FanTokensPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <UserRegistrationModal 
        isOpen={needsRegistration} 
        onComplete={completeRegistration} 
      />
      
      <DevelopmentModal />
      <Analytics />
    </>
  );
};

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <StakingProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </StakingProvider>
      </TooltipProvider>
    </QueryClientProvider>
    <Analytics />
    <SpeedInsights />
  </WagmiProvider>
);

export default App;
