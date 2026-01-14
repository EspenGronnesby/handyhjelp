import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Palette, ScrollText, Home, Shield } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { RoleManagement } from '@/components/platform/RoleManagement';
import { AuditLogViewer } from '@/components/platform/AuditLogViewer';
import { SiteEditingPanel } from '@/components/admin/SiteEditingPanel';

const OwnerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isOwner, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isOwner) {
      navigate('/dashboard');
    }
  }, [isOwner, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isOwner) {
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
              <span className="hidden md:inline text-sm text-muted-foreground">Eier</span>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin')}>
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
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
          <h1 className="text-2xl md:text-3xl font-bold">Eier-panel</h1>
          <p className="text-muted-foreground">Administrer brukere, roller og globale innstillinger</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-2 bg-transparent">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Brukere</span>
            </TabsTrigger>
            <TabsTrigger 
              value="editing" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Redigering</span>
            </TabsTrigger>
            <TabsTrigger 
              value="audit" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Logg</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="editing">
            <SiteEditingPanel />
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
