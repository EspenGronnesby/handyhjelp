import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Palette, ScrollText, Home, Shield, UserSearch } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { RoleManagement } from '@/components/platform/RoleManagement';
import { ActivityLogViewer } from '@/components/platform/ActivityLogViewer';
import { SiteEditingPanel } from '@/components/admin/SiteEditingPanel';
import { AllCustomersPanel } from '@/components/admin/AllCustomersPanel';

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
    <div>
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Eier-panel
            </h1>
            <p className="text-muted-foreground text-sm">Administrer brukere, roller og globale innstillinger</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-1 bg-muted/60 rounded-xl p-1">
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Brukere</span>
            </TabsTrigger>
            <TabsTrigger
              value="editing"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Redigering</span>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground"
            >
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Logg</span>
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground"
            >
              <UserSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Kunder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <RoleManagement />
          </TabsContent>



          <TabsContent value="editing">
            <SiteEditingPanel />
          </TabsContent>

          <TabsContent value="audit">
            <ActivityLogViewer />
          </TabsContent>

          <TabsContent value="customers">
            <AllCustomersPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;
