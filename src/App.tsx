import { Suspense, lazy } from "react";
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

// Landing page is loaded eagerly — it's the most common entry point.
import Index from "./pages/Index";

// All other pages are lazy-loaded for faster initial bundle.
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardActivity = lazy(() => import("./pages/DashboardActivity"));
const DashboardProfile = lazy(() => import("./pages/DashboardProfile"));
const DashboardNotifications = lazy(() => import("./pages/DashboardNotifications"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Services = lazy(() => import("./pages/Services"));
const ServiceVaktmester = lazy(() => import("./pages/ServiceVaktmester"));
const ServiceTakrennerens = lazy(() => import("./pages/ServiceTakrennerens"));
const ServiceTomrer = lazy(() => import("./pages/ServiceTomrer"));
const ServiceBlikk = lazy(() => import("./pages/ServiceBlikk"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const QuotePage = lazy(() => import("./pages/QuotePage"));
const ServiceAgreement = lazy(() => import("./pages/ServiceAgreement"));
const ThankYouAgreement = lazy(() => import("./pages/ThankYouAgreement"));
const ReviewSubmit = lazy(() => import("./pages/ReviewSubmit"));
const Personvern = lazy(() => import("./pages/Personvern"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Vilkaar = lazy(() => import("./pages/Vilkaar"));
const DashboardLoyalty = lazy(() => import("./pages/DashboardLoyalty"));
const Feedback = lazy(() => import("./pages/Feedback"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // Cache data i 5 minutter
    },
  },
});

// Minimal fallback shown while a lazy chunk loads. Mirrors page background
// so transitions feel less abrupt than a spinner.
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Marketing routes with page transitions
const MarketingRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </AnimatePresence>
  );
};

// App routes (dashboard, admin) - no page transitions
const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
        <Suspense fallback={<PageLoader />}>
          <PageTransition>
            <NotFound />
          </PageTransition>
        </Suspense>
      </AnimatePresence>
    );
  }

  return isAppRoute ? <AppRoutes /> : <MarketingRoutes />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={['light', 'dark', 'blue']}>
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
