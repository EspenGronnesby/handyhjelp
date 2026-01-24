import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { EditModeProvider } from "./contexts/EditModeContext";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/motion";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardActivity from "./pages/DashboardActivity";
import DashboardProfile from "./pages/DashboardProfile";
import DashboardNotifications from "./pages/DashboardNotifications";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
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
import ReviewSubmit from "./pages/ReviewSubmit";
import Personvern from "./pages/Personvern";
import Cookies from "./pages/Cookies";
import Vilkaar from "./pages/Vilkaar";
import DashboardLoyalty from "./pages/DashboardLoyalty";
import Feedback from "./pages/Feedback";

const queryClient = new QueryClient();

// Marketing routes with page transitions
const MarketingRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/tilbud" element={<PageTransition><QuotePage /></PageTransition>} />
        <Route path="/fast-avtale" element={<PageTransition><ServiceAgreement /></PageTransition>} />
        <Route path="/takk-avtale" element={<PageTransition><ThankYouAgreement /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/prosjekter" element={<PageTransition><Projects /></PageTransition>} />
        <Route path="/prosjekter/:id" element={<PageTransition><ProjectDetail /></PageTransition>} />
        <Route path="/om-oss" element={<PageTransition><About /></PageTransition>} />
        <Route path="/kontakt" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/tjenester" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/tjenester/vaktmester" element={<PageTransition><ServiceVaktmester /></PageTransition>} />
        <Route path="/tjenester/takrennerens" element={<PageTransition><ServiceTakrennerens /></PageTransition>} />
        <Route path="/tjenester/tomrer" element={<PageTransition><ServiceTomrer /></PageTransition>} />
        <Route path="/tjenester/blikk" element={<PageTransition><ServiceBlikk /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/raad" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/raad/:slug" element={<PageTransition><BlogDetail /></PageTransition>} />
        <Route path="/takk" element={<PageTransition><ThankYou /></PageTransition>} />
        <Route path="/anmeldelse/:jobId" element={<PageTransition><ReviewSubmit /></PageTransition>} />
        <Route path="/personvern" element={<PageTransition><Personvern /></PageTransition>} />
        <Route path="/cookies" element={<PageTransition><Cookies /></PageTransition>} />
        <Route path="/vilkaar" element={<PageTransition><Vilkaar /></PageTransition>} />
        <Route path="/tilbakemelding" element={<PageTransition><Feedback /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

// App routes (dashboard, admin) - no page transitions
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ErrorBoundary>
          <Dashboard />
        </ErrorBoundary>
      }>
        <Route index element={<DashboardActivity />} />
        <Route path="profile" element={<DashboardProfile />} />
        <Route path="notifications" element={<DashboardNotifications />} />
        <Route path="loyalty" element={<DashboardLoyalty />} />
        <Route path="admin" element={
          <ErrorBoundary>
            <AdminDashboard />
          </ErrorBoundary>
        } />
      </Route>
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/worker" element={<WorkerDashboard />} />
    </Routes>
  );
};

// Main router that combines marketing and app routes
const AppRouter = () => {
  const location = useLocation();
  
  // Check if current path is an app route (dashboard, owner, worker)
  const isAppRoute = location.pathname.startsWith('/dashboard') || 
                     location.pathname === '/owner' || 
                     location.pathname === '/worker';
  
  // Check for 404
  const isKnownRoute = [
    '/', '/tilbud', '/fast-avtale', '/takk-avtale', '/faq', '/prosjekter', '/om-oss',
    '/kontakt', '/tjenester', '/blog', '/raad', '/takk', '/personvern', '/cookies',
    '/vilkaar', '/tilbakemelding', '/auth', '/dashboard', '/owner', '/worker'
  ].some(route => location.pathname === route || location.pathname.startsWith(route + '/'));
  
  if (!isKnownRoute) {
    return (
      <AnimatePresence mode="wait">
        <PageTransition>
          <NotFound />
        </PageTransition>
      </AnimatePresence>
    );
  }
  
  return isAppRoute ? <AppRoutes /> : <MarketingRoutes />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <EditModeProvider>
            <Toaster />
            <Sonner position="top-center" duration={2000} />
            <BrowserRouter>
              <ScrollToTop />
              <AppRouter />
            </BrowserRouter>
          </EditModeProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;