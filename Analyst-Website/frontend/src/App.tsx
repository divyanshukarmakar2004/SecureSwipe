import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/components/ui/login";
import { UsersPage } from "./pages/Users";
import { ChartsPage } from "./pages/Charts";
import { SettingsPage } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { UserDetailsPage } from "./pages/UserDetails";
import Index from "./pages/Index";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/contexts/SettingsContext";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="fraud-dashboard-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Login onLogin={handleLogin} />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="fraud-dashboard-theme">
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index onLogout={handleLogout} />} />
                <Route path="/users" element={<UsersPage onLogout={handleLogout} />} />
                <Route path="/user/:userId" element={<UserDetailsPage />} />
                <Route path="/charts" element={<ChartsPage onLogout={handleLogout} />} />
                <Route path="/settings" element={<SettingsPage onLogout={handleLogout} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
