import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

const DashboardProfile = () => {
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || ''
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Min profil</h1>
          {roles.length > 0 && (
            <div className="flex gap-2">
              {roles.map((role) => (
                <Badge key={role} variant="default" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Oppdater dine personlige opplysninger
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profilinformasjon</CardTitle>
          <CardDescription>
            Denne informasjonen blir brukt når du sender inn tilbudsforespørsler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <p className="text-xs text-muted-foreground">
              E-postadressen kan ikke endres
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer</Label>
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lagre endringer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardProfile;
