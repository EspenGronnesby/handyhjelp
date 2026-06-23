import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useNavigationBadges } from '@/hooks/useNavigationBadges';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { Button } from '@/components/ui/button';
import { Briefcase, Shield, Upload, Bell, User } from 'lucide-react';
import { DashboardShellSkeleton } from '@/components/ui/skeleton-loaders';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { CustomerTypeModal } from '@/components/CustomerTypeModal';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isOwner, isAdmin, isWorker, loading: roleLoading } = useRole();
  const { badges } = useNavigationBadges();
  const navigate = useNavigate();
  const location = useLocation();
  const [showCustomerTypeModal, setShowCustomerTypeModal] = useState(false);

  useNotificationSound();

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

  if (loading) {
    return <DashboardShellSkeleton />;
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { path: '/dashboard', label: 'Oversikt', icon: Briefcase, badge: badges.overview },
    // Admin og eier: én samlet Administrasjon-lenke
    ...(isAdmin ? [
      { path: '/dashboard/admin', label: 'Administrasjon', icon: Shield, badge: badges.admin },
    ] : []),
    // Arbeider: Mine innleveringer
    ...(isWorker ? [
      { path: '/dashboard/worker', label: 'Mine innleveringer', icon: Upload, badge: badges.worker },
    ] : []),
  ];

  const NavButton = ({ item }: { item: typeof navItems[0] }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link to={item.path}>
        <button
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-secondary-foreground/75 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {item.label}
          {item.badge > 0 && (
            <span className={`ml-auto text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center animate-subtle-pulse ${
              isActive ? 'bg-white/20 text-white' : 'bg-destructive text-destructive-foreground'
            }`}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>
      </Link>
    );
  };

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
      <header className="bg-card border-b border-border/60 sticky top-0 z-40">
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={handyhjelpLogoWhite} alt="HandyHjelp" className="h-8 md:h-10" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-sm text-muted-foreground truncate max-w-[200px]">
                {user.email}
              </span>

              {/* Varsler-klokke — synlig på alle skjermstørrelser */}
              <Link to="/dashboard/notifications">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {badges.notifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-subtle-pulse">
                      {badges.notifications > 9 ? '9+' : badges.notifications}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Profil-knapp — bare synlig på mobil */}
              <Link to="/dashboard/profile" className="md:hidden">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => navigate('/')}>
                Tilbake til hjemmeside
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sidebar Navigation — skjult på mobil */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="bg-secondary rounded-xl p-3 sticky top-24 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}

              {/* Separator + klikkbar profilrad */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <Link to="/dashboard/profile">
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/10 group ${
                    location.pathname === '/dashboard/profile' ? 'bg-white/10' : ''
                  }`}>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.email?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-secondary-foreground/60 truncate block group-hover:text-secondary-foreground/90 transition-colors">
                        {user.email}
                      </span>
                      <span className="text-[10px] text-secondary-foreground/40 group-hover:text-secondary-foreground/60 transition-colors">
                        Min profil
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </aside>

          {/* Hovedinnhold */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobil bunnnavigasjon */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/60 md:hidden z-50">
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600" />
        <div className="flex justify-around items-center py-2 px-2 safe-area-inset-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[64px] min-h-[56px] px-2 py-1 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? 'text-primary bg-primary/15'
                    : 'text-muted-foreground hover:text-foreground active:bg-muted'
                }`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 mb-1" />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-subtle-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
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
