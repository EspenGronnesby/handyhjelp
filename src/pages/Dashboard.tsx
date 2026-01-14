import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Loader2, User, Bell, Briefcase, Shield, Home, Crown, Upload } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { CustomerTypeModal } from '@/components/CustomerTypeModal';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isOwner, isAdmin, isWorker, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkCustomerType = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('customer_type')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data && !data.customer_type) {
        setShowCustomerTypeModal(true);
      }
    };

    checkCustomerType();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Oversikt', icon: Briefcase },
    { path: '/dashboard/profile', label: 'Profil', icon: User },
    { path: '/dashboard/notifications', label: 'Varsler', icon: Bell },
    // Owner: Access to both Owner panel and Admin panel
    ...(isOwner ? [
      { path: '/owner', label: 'Eier', icon: Crown },
      { path: '/dashboard/admin', label: 'Admin', icon: Shield },
    ] : []),
    // Admin (not owner): Only Admin panel
    ...(isAdmin && !isOwner ? [
      { path: '/dashboard/admin', label: 'Admin', icon: Shield },
    ] : []),
    // Worker: Submissions
    ...(isWorker ? [
      { path: '/worker', label: 'Innleveringer', icon: Upload },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {showCustomerTypeModal && user && (
        <CustomerTypeModal 
          isOpen={showCustomerTypeModal}
          userId={user.id}
          onComplete={() => setShowCustomerTypeModal(false)}
        />
      )}
      
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={handyhjelpLogoWhite} alt="HandyHjelp" className="h-8 md:h-10" />
            </Link>
            <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => navigate('/')}>
              Tilbake til hjemmeside
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => navigate('/')}>
              <Home className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sidebar Navigation - Hidden on mobile */}
          <aside className="hidden md:block w-64 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2 min-h-[44px]"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
        <div className="flex justify-around items-center py-2 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-2 py-1 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground active:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium truncate max-w-[56px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
