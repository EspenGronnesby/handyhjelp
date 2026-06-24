import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, LogOut, Home, Building2, Crown, Hammer, UserCheck, User as UserIcon, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { LucideIcon } from 'lucide-react';

// Norske rolle-etiketter
const roleLabels: Record<string, string> = {
  platform_owner: 'Plattform-eier',
  tenant_admin: 'Administrator',
  worker: 'Medarbeider',
  admin: 'Admin',
  moderator: 'Moderator',
  user: 'Bruker'
};

// Ikoner per rolle
const roleIcons: Record<string, LucideIcon> = {
  platform_owner: Crown,
  tenant_admin: Shield,
  worker: Hammer,
  admin: Shield,
  moderator: UserCheck,
  user: UserIcon
};

// Prioritet (høyest først) — profilen viser kun den viktigste rollen
const ROLE_PRIORITY = ['platform_owner', 'tenant_admin', 'admin', 'moderator', 'worker', 'user'];

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  customer_type: 'private' | 'business' | null;
  org_number?: string;
  company_name?: string;
}

const DashboardProfile = () => {
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    customer_type: null,
    org_number: '',
    company_name: ''
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          customer_type: data.customer_type as 'private' | 'business' | null,
          org_number: data.org_number || '',
          company_name: data.company_name || ''
        });
      }

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesData) {
        setRoles(rolesData.map(r => r.role));
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke lagre profilen. Prøv igjen.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Lagret!',
        description: 'Profilen din er oppdatert.'
      });
    }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Feil',
        description: 'Passordene stemmer ikke overens.',
        variant: 'destructive'
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Feil',
        description: 'Passordet må være minst 6 tegn.',
        variant: 'destructive'
      });
      return;
    }
    
    setChangingPassword(true);
    
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });
    
    if (error) {
      toast({
        title: 'Feil',
        description: 'Kunne ikke endre passord. Prøv igjen.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Passord endret!',
        description: 'Ditt nye passord er nå aktivt.'
      });
      setNewPassword('');
      setConfirmPassword('');
    }
    
    setChangingPassword(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logget ut',
      description: 'Du er nå logget ut.'
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : profile.email[0]?.toUpperCase() ?? '?';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-md">
          {initials}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Min profil
          </h1>
          <div className="flex flex-wrap gap-2 mt-1">
            {profile.customer_type && (
              <Badge variant="outline" className="flex items-center gap-1">
                {profile.customer_type === 'private' ? (
                  <><Home className="h-3 w-3" /><span>Privatkunde</span></>
                ) : (
                  <><Building2 className="h-3 w-3" /><span>Bedriftskunde</span></>
                )}
              </Badge>
            )}
            {(() => {
              if (roles.length === 0) return null;
              const primaryRole = ROLE_PRIORITY.find((r) => roles.includes(r)) || roles[0];
              const Icon = roleIcons[primaryRole] || Shield;
              return (
                <Badge variant="default" className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {roleLabels[primaryRole] || primaryRole}
                </Badge>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="card-professional p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profilinformasjon</h2>
          <p className="text-sm text-muted-foreground">
            Denne informasjonen blir brukt når du sender inn tilbudsforespørsler
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Fullt navn</Label>
          <Input
            id="full_name"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">E-postadressen kan ikke endres</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="8 siffer"
            value={profile.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setProfile({ ...profile, phone: value });
            }}
            maxLength={8}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>
        {profile.customer_type === 'business' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="company_name">Bedriftsnavn</Label>
              <Input id="company_name" value={profile.company_name || ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org_number">Organisasjonsnummer</Label>
              <Input id="org_number" value={profile.org_number || ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Organisasjonsnummer kan ikke endres</p>
            </div>
          </>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lagre endringer
        </Button>
      </div>

      <div className="card-professional p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-sm">
            <Lock className="h-4 w-4 text-white drop-shadow" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Endre passord</h2>
            <p className="text-sm text-muted-foreground">Oppdater passordet ditt for økt sikkerhet</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new_password">Nytt passord</Label>
          <Input
            id="new_password"
            type="password"
            placeholder="Minst 6 tegn"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Bekreft nytt passord</Label>
          <Input
            id="confirm_password"
            type="password"
            placeholder="Skriv passordet på nytt"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
          />
        </div>
        <Button onClick={handlePasswordChange} disabled={changingPassword || !newPassword || !confirmPassword}>
          {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Endre passord
        </Button>
      </div>

      <div className="card-professional p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 shadow-sm">
            <UserIcon className="h-4 w-4 text-white drop-shadow" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Utseende</h2>
            <p className="text-sm text-muted-foreground">Velg mellom lys og mørk modus</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="card-professional p-6">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-destructive/30 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Logg ut
        </Button>
      </div>
    </div>
  );
};

export default DashboardProfile;
