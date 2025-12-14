import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { Quote, Job, Profile } from '@/types/admin';

// Admin components
import { AdminSummaryCards } from '@/components/admin/AdminSummaryCards';
import { QuoteCard } from '@/components/admin/QuoteCard';
import { JobCard } from '@/components/admin/JobCard';
import { ServiceAgreementCard } from '@/components/admin/ServiceAgreementCard';
import { CustomerCard } from '@/components/admin/CustomerCard';
import { CustomerDetailModal } from '@/components/admin/CustomerDetailModal';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { ProjectManagement } from '@/components/admin/ProjectManagement';
import { BlogManagement } from '@/components/admin/BlogManagement';
import { SiteEditingPanel } from '@/components/admin/SiteEditingPanel';
import { InvoiceUploadModal } from '@/components/admin/InvoiceUploadModal';
import { InvoiceManagement } from '@/components/admin/InvoiceManagement';

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'start' | 'complete' | 'delete' | null;
    item: Quote | Job | null;
  }>({ open: false, type: null, item: null });
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [invoiceJob, setInvoiceJob] = useState<Job | null>(null);

  const {
    profiles,
    agreements,
    loading,
    actionLoading,
    pendingQuotes,
    activeJobs,
    completedJobs,
    newAgreements,
    handleStartJob,
    handleCompleteJob,
    handleDeleteJob,
    handleUpdateAgreementStatus,
  } = useAdminData(isAdmin);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || loading) {
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Oversikt over alle forespørsler og jobber</p>
      </div>

      <AdminSummaryCards 
        totalCustomers={profiles.length}
        pendingQuotes={pendingQuotes.length}
        activeJobs={activeJobs.length}
      />

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList className="h-auto flex-wrap gap-2 p-2 bg-muted/50">
          <TabsTrigger value="requests" className="text-sm whitespace-nowrap">
            Forespørsler ({pendingQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="agreements" className="text-sm whitespace-nowrap">
            Avtaler ({newAgreements.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-sm whitespace-nowrap">
            Aktive ({activeJobs.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-sm whitespace-nowrap">
            Ferdig ({completedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="text-sm whitespace-nowrap">
            Fakturaer
          </TabsTrigger>
          <TabsTrigger value="customers" className="text-sm whitespace-nowrap">
            Kunder ({profiles.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="text-sm whitespace-nowrap">
            Prosjekter
          </TabsTrigger>
          <TabsTrigger value="blog" className="text-sm whitespace-nowrap">
            Blogg
          </TabsTrigger>
          <TabsTrigger value="site-editing" className="text-sm whitespace-nowrap">
            Redigering
          </TabsTrigger>
        </TabsList>

        {/* Nye forespørsler */}
        <TabsContent value="requests" className="space-y-4">
          {pendingQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen nye forespørsler
              </CardContent>
            </Card>
          ) : (
            pendingQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                actionLoading={actionLoading}
                onStartJob={(q) => setConfirmDialog({ open: true, type: 'start', item: q })}
              />
            ))
          )}
        </TabsContent>

        {/* Avtaleforespørsler */}
        <TabsContent value="agreements" className="space-y-4">
          {agreements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen avtaleforespørsler
              </CardContent>
            </Card>
          ) : (
            agreements.map((agreement) => (
              <ServiceAgreementCard
                key={agreement.id}
                agreement={agreement}
                onUpdateStatus={handleUpdateAgreementStatus}
              />
            ))
          )}
        </TabsContent>

        {/* Aktive jobber */}
        <TabsContent value="active" className="space-y-4">
          {activeJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen aktive jobber
              </CardContent>
            </Card>
          ) : (
            activeJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                variant="active"
                actionLoading={actionLoading}
                onComplete={(j) => setConfirmDialog({ open: true, type: 'complete', item: j })}
              />
            ))
          )}
        </TabsContent>

        {/* Ferdig */}
        <TabsContent value="completed" className="space-y-4">
          {completedJobs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ingen fullførte jobber
              </CardContent>
            </Card>
          ) : (
            completedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                variant="completed"
                actionLoading={actionLoading}
                onDelete={(j) => setConfirmDialog({ open: true, type: 'delete', item: j })}
                onAddInvoice={(j) => setInvoiceJob(j)}
              />
            ))
          )}
        </TabsContent>

        {/* Fakturaer */}
        <TabsContent value="invoices">
          <InvoiceManagement />
        </TabsContent>

        {/* Kunder */}
        <TabsContent value="customers" className="space-y-4">
          {profiles.map((profile) => (
            <CustomerCard 
              key={profile.id} 
              profile={profile} 
              onClick={() => setSelectedCustomer(profile)}
            />
          ))}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <ProjectManagement />
        </TabsContent>

        {/* Blog Tab */}
        <TabsContent value="blog">
          <BlogManagement />
        </TabsContent>

        {/* Site Editing Tab */}
        <TabsContent value="site-editing">
          <SiteEditingPanel />
        </TabsContent>
      </Tabs>

      <AdminConfirmDialog
        dialog={confirmDialog}
        onClose={() => setConfirmDialog({ open: false, type: null, item: null })}
        onStartJob={handleConfirmedStartJob}
        onCompleteJob={handleConfirmedCompleteJob}
        onDeleteJob={handleConfirmedDeleteJob}
      />

      <CustomerDetailModal
        profile={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <InvoiceUploadModal
        job={invoiceJob}
        open={!!invoiceJob}
        onOpenChange={(open) => !open && setInvoiceJob(null)}
        onSuccess={() => setInvoiceJob(null)}
      />
    </div>
  );
};

export default AdminDashboard;
