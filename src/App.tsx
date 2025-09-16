// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navigation from "./components/Navigation";

// Publieke pagina's
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Supabase test
import SupabaseTest from "./pages/SupabaseTest";

// Auth + protected
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import AuthGate from "./components/AuthGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={150}>
      <BrowserRouter>
        {/* Top navigatie */}
        <Navigation />

        {/* Pagina router */}
        <Routes>
          {/* Publiek */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Supabase verbindingscheck */}
          <Route path="/supabase-test" element={<SupabaseTest />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <AuthGate>
                <Dashboard />
              </AuthGate>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global toasters */}
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
