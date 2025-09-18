// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Marketing / normale pagina's
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import SupabaseTest from "./pages/SupabaseTest";

// Dashboard layout + pagina's
import DashboardLayout from "./layouts/DashboardLayout";
import LoadingPage from "./pages/dashboard/Loading";   // <— NIEUW
import Overview from "./pages/dashboard/Overview";
import Invoices from "./pages/dashboard/Invoices";
import Purchases from "./pages/dashboard/Purchases";
import Banking from "./pages/dashboard/Banking";
import VatPage from "./pages/dashboard/Vat";
import Contracts from "./pages/dashboard/Contracts";
import Documents from "./pages/dashboard/Documents";
import Projects from "./pages/dashboard/Projects";
import Customers from "./pages/dashboard/Customers";
import Timesheets from "./pages/dashboard/Timesheets";
import HR from "./pages/dashboard/HR";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";

const queryClient = new QueryClient();

function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <>
      {/* Marketing navigatie alleen buiten dashboard */}
      {!isDashboard && <Navigation />}

      <Routes>
        {/* Landingssite */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Supabase test */}
        <Route path="/supabase-test" element={<SupabaseTest />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="loading" element={<LoadingPage />} />   {/* <— NIEUW */}
          <Route path="invoices" element={<Invoices />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="banking" element={<Banking />} />
          <Route path="vat" element={<VatPage />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="documents" element={<Documents />} />
          <Route path="projects" element={<Projects />} />
          <Route path="customers" element={<Customers />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="hr" element={<HR />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global toasters */}
      <Toaster />
      <Sonner />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={150}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
