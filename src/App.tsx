
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToasterProvider } from "@/hooks/use-toast";
import Index from "./pages/Index";
import LeaderboardPage from "./pages/LeaderboardPage";
import AboutPage from "./pages/AboutPage";
import ManagementPage from "./pages/ManagementPage";
import LogsPage from "./pages/LogsPage";
import NotFound from "./pages/NotFound";
import { MetaTags } from './components/MetaTags';

const App = () => {
  // Create a QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());

  // Add Sarabun font
  useEffect(() => {
    // Add Sarabun font from Google Fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
    
    // Apply Sarabun font to the body
    document.body.classList.add('font-sarabun');
    
    return () => {
      // Clean up
      document.head.removeChild(link);
    };
  }, []);

  return (
    <>
      <MetaTags />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ToasterProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/management" element={<ManagementPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ToasterProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
