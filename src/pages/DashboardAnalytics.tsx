import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsPanel } from '@/components/admin/analytics/AnalyticsPanel';
import { Loader2 } from 'lucide-react';

const DashboardAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isOwner, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin && !isOwner) navigate('/dashboard');
  }, [isAdmin, isOwner, roleLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isOwner)) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['analytics'] });
    setLastRefreshed(new Date());
    // Visual feedback
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Oversikt
            </Button>
          </Link>
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analyse</h1>
            <p className="text-muted-foreground text-sm">
              Live data fra besøkende og henvendelser
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Sist oppdatert {lastRefreshed.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Oppdater
          </Button>
        </div>
      </div>

      <AnalyticsPanel />
    </div>
  );
};

export default DashboardAnalytics;
