import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useTenant } from '@/hooks/useTenant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Users, Briefcase, FileText, Home } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { ContentApprovalQueue } from '@/components/admin/ContentApprovalQueue';
import { TenantWorkerManagement } from '@/components/admin/TenantWorkerManagement';

const TenantAdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isTenantAdmin, isPlatformOwner, loading: roleLoading } = useRole();
  const { tenant, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('approval');

  const canAccess = isTenantAdmin || isPlatformOwner;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !canAccess) {
      navigate('/dashboard');
    }
  }, [canAccess, roleLoading, navigate]);

  if (authLoading || roleLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={handyhjelpLogoWhite} alt="HandyHjelp" className="h-8 md:h-10" />
            </Link>
            <div className="flex items-center gap-2">
              {tenant && (
                <span className="hidden md:inline text-sm text-muted-foreground">{tenant.name}</span>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Tenant Administrasjon</h1>
          <p className="text-muted-foreground">
            Godkjenn innhold og administrer workers
            {tenant && <span className="font-medium"> - {tenant.name}</span>}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent">
            <TabsTrigger 
              value="approval" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Godkjenning</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workers" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Workers</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              onClick={() => navigate('/dashboard/admin')}
            >
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Full Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approval">
            <ContentApprovalQueue />
          </TabsContent>

          <TabsContent value="workers">
            <TenantWorkerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TenantAdminDashboard;
