import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsPanel } from '@/components/admin/analytics/AnalyticsPanel';

const DashboardAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isOwner, loading: roleLoading } = useRole();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-4">
      <Link to="/dashboard">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Oversikt
        </Button>
      </Link>

      <AnalyticsPanel />
    </div>
  );
};

export default DashboardAnalytics;
