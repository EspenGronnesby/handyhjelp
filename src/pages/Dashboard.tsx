import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList, User, Bell, Home, Star, Shield } from 'lucide-react';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';
import { CustomerTypeModal } from '@/components/CustomerTypeModal';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();
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

  if (loading) {
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
    { path: '/dashboard', label: 'Oversikt', icon: Home },
    { path: '/dashboard/activity', label: 'Forespørsler', icon: ClipboardList },
    // { path: '/dashboard/loyalty', label: 'Kundeklubb', icon: Star }, // Hidden temporarily
    { path: '/dashboard/profile', label: 'Profil', icon: User },
    { path: '/dashboard/notifications', label: 'Varsler', icon: Bell },
    ...(isAdmin ? [{ path: '/dashboard/admin', label: 'Admin', icon: Shield }] : [])
  ];

  return (
    <div className="min-h-screen bg-background">
      {showCustomerTypeModal && user && (
        <CustomerTypeModal 
          isOpen={showCustomerTypeModal}
          userId={user.id}
          onComplete={() => setShowCustomerTypeModal(false)}
        />
      )}
      
      {/* Top Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={handyhjelpLogoWhite} alt="HandyHjelp" className="h-10" />
            </Link>
            <Button variant="outline" onClick={() => navigate('/')}>
              Tilbake til hjemmeside
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-2"
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
    </div>
  );
};

export default Dashboard;
