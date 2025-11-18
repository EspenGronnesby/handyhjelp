import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import DashboardQuotes from "./pages/DashboardQuotes";
import DashboardJobs from "./pages/DashboardJobs";
import DashboardLoyalty from "./pages/DashboardLoyalty";
import DashboardProfile from "./pages/DashboardProfile";
import DashboardNotifications from "./pages/DashboardNotifications";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerPortal from "./pages/CustomerPortal";
import FAQ from "./pages/FAQ";
import Projects from "./pages/Projects";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/prosjekter" element={<Projects />} />
            <Route path="/kunde-innlogging" element={<CustomerLogin />} />
            <Route path="/kunde-portal" element={<CustomerPortal />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="quotes" element={<DashboardQuotes />} />
              <Route path="jobs" element={<DashboardJobs />} />
              <Route path="loyalty" element={<DashboardLoyalty />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="notifications" element={<DashboardNotifications />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
