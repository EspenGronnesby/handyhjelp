import { useEffect, useState, useCallback, useRef } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useRole } from '@/hooks/useRole';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, CreditCard, FileText, Package, ChevronLeft, ChevronRight, Plus, Mail, Shield, Users, Palette, ScrollText } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { RoleManagement } from '@/components/platform/RoleManagement';
import { ActivityLogViewer } from '@/components/platform/ActivityLogViewer';
import { SiteEditingPanel } from '@/components/admin/SiteEditingPanel';
import { Quote, Job, Profile, ServiceAgreement, AgreementStatusFilter, SingleJobStatusFilter, SINGLE_JOB_STATUS_LABELS } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Admin components
import { AdminSummaryCards } from '@/components/admin/AdminSummaryCards';
import { QuoteCard } from '@/components/admin/QuoteCard';
import { JobCard } from '@/components/admin/JobCard';
import { ServiceAgreementCard } from '@/components/admin/ServiceAgreementCard';
import { CustomerCard } from '@/components/admin/CustomerCard';
import { CustomerDetailModal } from '@/components/admin/CustomerDetailModal';
import { GuestCustomerModal } from '@/components/admin/GuestCustomerModal';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import { BlogManagement } from '@/components/admin/BlogManagement';
import { InvoiceUploadModal } from '@/components/admin/InvoiceUploadModal';
import { InvoiceManagement } from '@/components/admin/InvoiceManagement';
import ReviewManagement from '@/components/admin/ReviewManagement';
import { QuickFeedbackStats } from '@/components/admin/QuickFeedbackStats';
import { OfferModal } from '@/components/admin/OfferModal';
import { ContractModal } from '@/components/admin/ContractModal';
import { RejectAgreementModal } from '@/components/admin/RejectAgreementModal';
import { CreateJobModal } from '@/components/admin/CreateJobModal';
import { EmailTemplateManager } from '@/components/admin/EmailTemplateManager';
import { EmailComposer } from '@/components/admin/EmailComposer';
import { EmailHistory } from '@/components/admin/EmailHistory';
import { AllCustomersPanel } from '@/components/admin/AllCustomersPanel';

type CategoryKey = 'oppdrag' | 'okonomi' | 'innhold' | 'mail' | 'brukere' | 'redigering' | 'logg';

const VALID_CATEGORIES: CategoryKey[] = ['oppdrag', 'okonomi', 'innhold', 'mail', 'brukere'];

const CATEGORY_DEFAULT_TABS: Record<CategoryKey, string> = {
  oppdrag: 'single-jobs',
  okonomi: 'invoices',
  innhold: 'projects',
  mail: 'templates',
  brukere: 'kunder',
  redigering: 'redigering',
  logg: 'logg',
};

const CATEGORY_GRADIENTS: Partial<Record<CategoryKey, string>> = {
  oppdrag:  'from-cyan-500 via-blue-500 to-indigo-600',
  okonomi:  'from-emerald-500 via-teal-500 to-cyan-600',
  innhold:  'from-fuchsia-500 via-purple-500 to-indigo-600',
  mail:     'from-amber-500 via-orange-500 to-rose-600',
  brukere:  'from-rose-500 via-pink-500 to-fuchsia-600',
  redigering:'from-yellow-500 via-amber-500 to-orange-600',
  logg:     'from-slate-500 via-gray-500 to-zinc-600',
};

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { isOwner } = useRole();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { badges } = useNavigationBadges();
  
  // Read initial state from URL params
  const urlCategory = searchParams.get('category') as CategoryKey | null;
  const urlTab = searchParams.get('tab');
  
  const initialCategory = urlCategory && VALID_CATEGORIES.includes(urlCategory) ? urlCategory : 'oppdrag';
  const initialTab = urlTab || CATEGORY_DEFAULT_TABS[initialCategory];
  
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(initialCategory);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'start' | 'complete' | 'delete' | 'delete_quote' | 'complete_directly' | null;
    item: Quote | Job | null;
  }>({ open: false, type: null, item: null });
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [invoiceJob, setInvoiceJob] = useState<Job | null>(null);
  const [offerAgreement, setOfferAgreement] = useState<ServiceAgreement | null>(null);
  const [contractAgreement, setContractAgreement] = useState<ServiceAgreement | null>(null);
  const [rejectAgreement, setRejectAgreement] = useState<ServiceAgreement | null>(null);
  const [agreementStatusFilter, setAgreementStatusFilter] = useState<AgreementStatusFilter>('new');
  const [singleJobStatusFilter, setSingleJobStatusFilter] = useState<SingleJobStatusFilter>('pending');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [guestCustomer, setGuestCustomer] = useState<{ email: string; name: string } | null>(null);

  const {
    profiles,
    agreements,
    loading,
    actionLoading,
    pendingQuotes,
    activeJobs,
    completedJobs,
    paginatedCompletedJobs,
    recentCompletedJobsCount,
    oldCompletedJobsCount,
    showOldCompletedJobs,
    setShowOldCompletedJobs,
    completedJobsPage,
    setCompletedJobsPage,
    totalCompletedPages,
    newAgreements,
    handleStartJob,
    handleCompleteJob,
    handleDeleteJob,
    handleDeleteQuote,
    handleCreateJob,
    handleCompleteJobWithoutStart,
    handleUpdateAgreementStatus,
    handleRejectAgreement,
    refreshData,
  } = useAdminData(isAdmin);

  // Calculate total single jobs count
  const totalSingleJobs = pendingQuotes.length + activeJobs.length + completedJobs.length;
  
  // Count single jobs by status
  const singleJobStatusCounts = {
    pending: pendingQuotes.length,
    in_progress: activeJobs.length,
    completed: completedJobs.length,
  };

  // Category configuration with realtime badge counts
  const baseCategories = {
    oppdrag: {
      label: 'Oppdrag',
      icon: Briefcase,
      tabs: [
        { key: 'single-jobs', label: 'Enkelt-jobber', count: totalSingleJobs, badge: badges.adminDetails.pendingQuotes + badges.adminDetails.activeJobs },
        { key: 'agreements', label: 'Faste avtaler', count: agreements.length, badge: badges.adminDetails.newAgreements },
      ],
      totalBadge: badges.adminDetails.pendingQuotes + badges.adminDetails.newAgreements + badges.adminDetails.activeJobs,
    },
    okonomi: {
      label: 'Økonomi',
      icon: CreditCard,
      tabs: [
        { key: 'invoices', label: 'Fakturaer', count: null, badge: 0 },
      ],
      totalBadge: 0,
    },
    innhold: {
      label: 'Innhold / anmeldelser',
      icon: FileText,
      tabs: [
        { key: 'projects', label: 'Prosjekter', count: null, badge: badges.adminDetails.pendingProjects },
        { key: 'blog', label: 'Blogg', count: null, badge: badges.adminDetails.pendingBlogs },
        { key: 'reviews', label: 'Anmeldelser', count: null, badge: badges.adminDetails.pendingReviews },
      ],
      totalBadge: badges.adminDetails.pendingProjects + badges.adminDetails.pendingBlogs + badges.adminDetails.pendingReviews,
    },
    mail: {
      label: 'E-post',
      icon: Mail,
      tabs: [
        { key: 'templates', label: 'Maler', count: null, badge: 0 },
        { key: 'compose', label: 'Send e-post', count: null, badge: 0 },
        { key: 'history', label: 'Historikk', count: null, badge: 0 },
      ],
      totalBadge: 0,
    },
    brukere: {
      label: 'Brukere',
      icon: Users,
      tabs: [
        { key: 'kunder', label: 'Kunder', count: profiles.length, badge: 0 },
        { key: 'rollestyring', label: 'Rollestyring', count: null, badge: 0 },
      ],
      totalBadge: 0,
    },
  };

  const ownerCategories = isOwner ? {
    redigering: {
      label: 'Redigering',
      icon: Palette,
      tabs: [{ key: 'redigering', label: 'Nettstedsinnhold', count: null, badge: 0 }],
      totalBadge: 0,
    },
    logg: {
      label: 'Logg',
      icon: ScrollText,
      tabs: [{ key: 'logg', label: 'Aktivitetslogg', count: null, badge: 0 }],
      totalBadge: 0,
    },
  } : {};

  const categories = { ...baseCategories, ...ownerCategories };

  // Set default tab when category changes and update URL
  const handleCategoryChange = useCallback((category: CategoryKey) => {
    const newTab = categories[category].tabs[0].key;
    setActiveCategory(category);
    setActiveTab(newTab);
    setSearchParams({ category, tab: newTab }, { replace: true });
  }, [setSearchParams]);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSearchParams({ category: activeCategory, tab }, { replace: true });
  }, [activeCategory, setSearchParams]);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  const hasLoadedOnceRef = useRef(false);
  const isInitialLoad = (adminLoading || loading) && !hasLoadedOnceRef.current;
  if (!isInitialLoad) {
    hasLoadedOnceRef.current = true;
  }
  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleConfirmedStartJob = async (quote: Quote) => {
    await handleStartJob(quote);
    setConfirmDialog({ open: false, type: null, item: null });
  };

  const handleConfirmedCompleteJob = async (job: Job) => {
    await handleCompleteJob(job);
    setConfirmDialog({ open: false, type: null, item: null });
  };

  const handleConfirmedDeleteJob = async (job: Job) => {
    await handleDeleteJob(job);
    setConfirmDialog({ open: false, type: null, item: null });
  };

  const handleConfirmedDeleteQuote = async (quote: Quote) => {
    await handleDeleteQuote(quote);
    setConfirmDialog({ open: false, type: null, item: null });
  };

  const handleConfirmedRejectAgreement = async (agreementId: string, reason: string) => {
    await handleRejectAgreement(agreementId, reason);
  };

  const handleConfirmedCompleteJobDirectly = async (quote: Quote) => {
    await handleCompleteJobWithoutStart(quote);
    setConfirmDialog({ open: false, type: null, item: null });
  };

  // Filter agreements by status
  const filteredAgreements = agreementStatusFilter === 'all' 
    ? agreements 
    : agreements.filter(a => a.status === agreementStatusFilter);

  // Count agreements by status
  const agreementStatusCounts = {
    all: agreements.length,
    new: agreements.filter(a => a.status === 'new').length,
    under_review: agreements.filter(a => a.status === 'under_review').length,
    offer_sent: agreements.filter(a => a.status === 'offer_sent').length,
    contract_signed: agreements.filter(a => a.status === 'contract_signed').length,
    rejected: agreements.filter(a => a.status === 'rejected').length,
  };

  const currentCategory = categories[activeCategory];

  return (
    <div className="container mx-auto py-8 px-4 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-sm">
            <Shield className="h-5 w-5 text-white drop-shadow" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">Oversikt over alle forespørsler og jobber</p>
      </div>

      <AdminSummaryCards 
        totalCustomers={profiles.length}
        pendingQuotes={pendingQuotes.length}
        activeJobs={activeJobs.length}
      />

      {/* Main Category Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(Object.keys(categories) as CategoryKey[]).map((key) => {
          const category = categories[key];
          const Icon = category.icon;
          const isActive = activeCategory === key;
          
          return (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-sm transition-transform duration-200",
                isActive ? "scale-110" : "",
                CATEGORY_GRADIENTS[key] || 'from-cyan-500 via-blue-500 to-indigo-600'
              )}>
                <Icon className="h-7 w-7 text-white drop-shadow" />
              </div>
              <span className="font-semibold text-base">{category.label}</span>
              {category.totalBadge > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {category.totalBadge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-category Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-1 p-1 bg-muted/60 rounded-xl">
          {currentCategory.tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="text-sm whitespace-nowrap gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-background/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:bg-background/80 data-[state=inactive]:hover:text-foreground"
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
              {tab.badge > 0 && (
                <Badge variant="destructive" className="text-xs ml-1">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Enkelt-jobber */}
        <TabsContent value="single-jobs" className="space-y-4">
          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2 pb-2 items-center">
            {(Object.keys(SINGLE_JOB_STATUS_LABELS) as SingleJobStatusFilter[]).map((status) => {
              const statusBadge = status === 'pending' ? badges.adminDetails.pendingQuotes : 
                                  status === 'in_progress' ? badges.adminDetails.activeJobs : 0;
              return (
                <Button 
                  key={status}
                  size="sm" 
                  variant={singleJobStatusFilter === status ? 'default' : 'outline'}
                  onClick={() => setSingleJobStatusFilter(status)}
                  className="gap-2"
                >
                  {SINGLE_JOB_STATUS_LABELS[status]} ({singleJobStatusCounts[status]})
                  {statusBadge > 0 && singleJobStatusFilter !== status && (
                    <Badge variant="destructive" className="text-xs">
                      {statusBadge}
                    </Badge>
                  )}
                </Button>
              );
            })}
            <div className="ml-auto">
              <Button onClick={() => setShowCreateJobModal(true)} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Opprett oppdrag
              </Button>
            </div>
          </div>

          {/* Nye forespørsler (pending) */}
          {singleJobStatusFilter === 'pending' && (
            <>
              {pendingQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  actionLoading={actionLoading}
                  onStartJob={(q) => setConfirmDialog({ open: true, type: 'start', item: q })}
                  onCompleteDirectly={(q) => setConfirmDialog({ open: true, type: 'complete_directly', item: q })}
                  onDelete={(q) => setConfirmDialog({ open: true, type: 'delete_quote', item: q })}
                  onViewHistory={(email, name) => setGuestCustomer({ email, name })}
                />
              ))}
            </>
          )}

          {/* Aktive jobber (in_progress) */}
          {singleJobStatusFilter === 'in_progress' && (
            <>
              {activeJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="active"
                  actionLoading={actionLoading}
                  onComplete={(j) => setConfirmDialog({ open: true, type: 'complete', item: j })}
                  onViewHistory={(email, name) => setGuestCustomer({ email, name })}
                />
              ))}
            </>
          )}

          {/* Ferdige jobber (completed) */}
          {singleJobStatusFilter === 'completed' && (
            <>
              {paginatedCompletedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="completed"
                  actionLoading={actionLoading}
                  onDelete={(j) => setConfirmDialog({ open: true, type: 'delete', item: j })}
                  onAddInvoice={(j) => setInvoiceJob(j)}
                />
              ))}

              {/* Show/hide old jobs toggle */}
              {!showOldCompletedJobs && oldCompletedJobsCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowOldCompletedJobs(true)}
                  className="w-full"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Vis {oldCompletedJobsCount} eldre ferdige oppdrag
                </Button>
              )}

              {showOldCompletedJobs && oldCompletedJobsCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowOldCompletedJobs(false)}
                  className="w-full"
                >
                  Skjul eldre oppdrag
                </Button>
              )}

              {/* Pagination */}
              {totalCompletedPages > 1 && singleJobStatusFilter === 'completed' && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCompletedJobsPage(p => Math.max(1, p - 1))}
                        className={completedJobsPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalCompletedPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCompletedJobsPage(page)}
                          isActive={completedJobsPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCompletedJobsPage(p => Math.min(totalCompletedPages, p + 1))}
                        className={completedJobsPage === totalCompletedPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}

          {/* Tom tilstand */}
          {totalSingleJobs === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen enkelt-jobber
              </CardContent>
            </Card>
          )}

          {singleJobStatusFilter === 'pending' && pendingQuotes.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen nye forespørsler
              </CardContent>
            </Card>
          )}

          {singleJobStatusFilter === 'in_progress' && activeJobs.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen aktive jobber
              </CardContent>
            </Card>
          )}

          {singleJobStatusFilter === 'completed' && paginatedCompletedJobs.length === 0 && !showOldCompletedJobs && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen fullførte jobber den siste måneden
                {oldCompletedJobsCount > 0 && (
                  <Button
                    variant="link"
                    onClick={() => setShowOldCompletedJobs(true)}
                    className="ml-2"
                  >
                    Vis {oldCompletedJobsCount} eldre oppdrag
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Faste avtaler */}
        <TabsContent value="agreements" className="space-y-4">
          {/* Status filter buttons */}
          <div className="flex flex-wrap gap-2 pb-2">
            <Button 
              size="sm" 
              variant={agreementStatusFilter === 'new' ? 'default' : 'outline'}
              onClick={() => setAgreementStatusFilter('new')}
              className="gap-2"
            >
              Nye ({agreementStatusCounts.new})
              {badges.adminDetails.newAgreements > 0 && agreementStatusFilter !== 'new' && (
                <Badge variant="destructive" className="text-xs">
                  {badges.adminDetails.newAgreements}
                </Badge>
              )}
            </Button>
            <Button 
              size="sm" 
              variant={agreementStatusFilter === 'under_review' ? 'default' : 'outline'}
              onClick={() => setAgreementStatusFilter('under_review')}
            >
              Under vurdering ({agreementStatusCounts.under_review})
            </Button>
            <Button 
              size="sm" 
              variant={agreementStatusFilter === 'offer_sent' ? 'default' : 'outline'}
              onClick={() => setAgreementStatusFilter('offer_sent')}
            >
              Tilbud sendt ({agreementStatusCounts.offer_sent})
            </Button>
            <Button 
              size="sm" 
              variant={agreementStatusFilter === 'contract_signed' ? 'default' : 'outline'}
              onClick={() => setAgreementStatusFilter('contract_signed')}
            >
              Avtale inngått ({agreementStatusCounts.contract_signed})
            </Button>
            <Button 
              size="sm" 
              variant={agreementStatusFilter === 'rejected' ? 'destructive' : 'outline'}
              onClick={() => setAgreementStatusFilter('rejected')}
            >
              Avslått ({agreementStatusCounts.rejected})
            </Button>
          </div>

          {filteredAgreements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen avtaler med denne statusen
              </CardContent>
            </Card>
          ) : (
            filteredAgreements.map((agreement) => (
              <ServiceAgreementCard
                key={agreement.id}
                agreement={agreement}
                onUpdateStatus={handleUpdateAgreementStatus}
                onSendOffer={(a) => setOfferAgreement(a)}
                onUploadContract={(a) => setContractAgreement(a)}
                onReject={(a) => setRejectAgreement(a)}
              />
            ))
          )}
        </TabsContent>
        <TabsContent value="invoices" forceMount className="data-[state=inactive]:hidden">
          <InvoiceManagement />
        </TabsContent>

        {/* Kunder */}
        <TabsContent value="kunder" className="space-y-4">
          <AllCustomersPanel />
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" forceMount className="data-[state=inactive]:hidden">
          <ProjectManagement />
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog" forceMount className="data-[state=inactive]:hidden">
          <BlogManagement />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" forceMount className="data-[state=inactive]:hidden">
          <ReviewManagement />
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" forceMount className="data-[state=inactive]:hidden">
          <EmailTemplateManager />
        </TabsContent>

        {/* Email Composer Tab */}
        <TabsContent value="compose" forceMount className="data-[state=inactive]:hidden">
          <EmailComposer profiles={profiles} />
        </TabsContent>

        {/* Email History Tab */}
        <TabsContent value="history" forceMount className="data-[state=inactive]:hidden">
          <EmailHistory />
        </TabsContent>

        {/* Brukere: Rollestyring — owner kan endre, admin read-only */}
        <TabsContent value="rollestyring" forceMount className="data-[state=inactive]:hidden">
          <RoleManagement canManageRoles={isOwner} />
        </TabsContent>

        {/* Eier: Redigering av nettstedsinnhold */}
        {isOwner && (
          <TabsContent value="redigering" forceMount className="data-[state=inactive]:hidden">
            <SiteEditingPanel />
          </TabsContent>
        )}

        {/* Eier: Aktivitetslogg */}
        {isOwner && (
          <TabsContent value="logg" forceMount className="data-[state=inactive]:hidden">
            <ActivityLogViewer />
          </TabsContent>
        )}

      </Tabs>

      <AdminConfirmDialog
        dialog={confirmDialog}
        onClose={() => setConfirmDialog({ open: false, type: null, item: null })}
        onStartJob={handleConfirmedStartJob}
        onCompleteJob={handleConfirmedCompleteJob}
        onDeleteJob={handleConfirmedDeleteJob}
        onDeleteQuote={handleConfirmedDeleteQuote}
        onCompleteJobDirectly={handleConfirmedCompleteJobDirectly}
      />

      <CustomerDetailModal
        profile={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <GuestCustomerModal
        email={guestCustomer?.email ?? null}
        name={guestCustomer?.name ?? null}
        open={!!guestCustomer}
        onClose={() => setGuestCustomer(null)}
      />

      <InvoiceUploadModal
        job={invoiceJob}
        open={!!invoiceJob}
        onOpenChange={(open) => !open && setInvoiceJob(null)}
        onSuccess={() => setInvoiceJob(null)}
      />

      <OfferModal
        agreement={offerAgreement}
        open={!!offerAgreement}
        onClose={() => setOfferAgreement(null)}
        onSuccess={() => refreshData()}
      />

      <ContractModal
        agreement={contractAgreement}
        open={!!contractAgreement}
        onClose={() => setContractAgreement(null)}
        onSuccess={() => refreshData()}
      />

      <RejectAgreementModal
        agreement={rejectAgreement}
        open={!!rejectAgreement}
        onClose={() => setRejectAgreement(null)}
        onConfirm={handleConfirmedRejectAgreement}
      />

      <CreateJobModal
        open={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        profiles={profiles}
        onCreateJob={async (profile, description, address, action) => {
          await handleCreateJob(profile, description, address, action);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
