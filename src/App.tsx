import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { EditModeProvider } from "./contexts/EditModeContext";
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
import AdminDashboard from "./pages/AdminDashboard";
import FAQ from "./pages/FAQ";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import ServiceVaktmester from "./pages/ServiceVaktmester";
import ServiceTakrennerens from "./pages/ServiceTakrennerens";
import ServiceTomrer from "./pages/ServiceTomrer";
import ServiceBlikk from "./pages/ServiceBlikk";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import ThankYou from "./pages/ThankYou";
import QuotePage from "./pages/QuotePage";
import ServiceAgreement from "./pages/ServiceAgreement";
import ThankYouAgreement from "./pages/ThankYouAgreement";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EditModeProvider>
          <Toaster />
          <Sonner position="top-center" duration={2000} />
          <BrowserRouter>
            <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tilbud" element={<QuotePage />} />
            <Route path="/fast-avtale" element={<ServiceAgreement />} />
            <Route path="/takk-avtale" element={<ThankYouAgreement />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/prosjekter" element={<Projects />} />
            <Route path="/prosjekter/:id" element={<ProjectDetail />} />
            <Route path="/om-oss" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
            <Route path="/tjenester" element={<Services />} />
            <Route path="/tjenester/vaktmester" element={<ServiceVaktmester />} />
            <Route path="/tjenester/takrennerens" element={<ServiceTakrennerens />} />
            <Route path="/tjenester/tomrer" element={<ServiceTomrer />} />
            <Route path="/tjenester/blikk" element={<ServiceBlikk />} />
            <Route path="/raad" element={<Blog />} />
            <Route path="/raad/:slug" element={<BlogDetail />} />
            <Route path="/takk" element={<ThankYou />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="quotes" element={<DashboardQuotes />} />
              <Route path="jobs" element={<DashboardJobs />} />
              {/* <Route path="loyalty" element={<DashboardLoyalty />} /> */} {/* Hidden temporarily */}
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </EditModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
