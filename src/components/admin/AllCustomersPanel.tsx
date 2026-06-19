import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, UserX, Mail, Phone, Building2 } from 'lucide-react';
import { Profile } from '@/types/admin';
import { CustomerCard } from './CustomerCard';
import { CustomerDetailModal } from './CustomerDetailModal';
import { GuestCustomerModal } from './GuestCustomerModal';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

interface GuestCustomer {
  email: string;
  name: string;
  company_name?: string;
  phone?: string;
  type: string;
  latest_quote: string;
}

export const AllCustomersPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [guests, setGuests] = useState<GuestCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<{ email: string; name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, quotesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('quotes')
          .select('name, email, company_name, phone, type, created_at')
          .is('user_id', null)
          .order('created_at', { ascending: false }),
      ]);

      setProfiles(profilesRes.data || []);

      // Dedupliser gjester per e-post, behold nyeste
      const seen = new Map<string, GuestCustomer>();
      for (const q of (quotesRes.data || [])) {
        if (!seen.has(q.email)) {
          seen.set(q.email, {
            email: q.email,
            name: q.name,
            company_name: q.company_name,
            phone: q.phone,
            type: q.type,
            latest_quote: q.created_at,
          });
        }
      }
      setGuests(Array.from(seen.values()));
    } finally {
      setLoading(false);
    }
  };

  const term = searchTerm.toLowerCase();

  const filteredProfiles = profiles.filter(p =>
    !term ||
    p.full_name?.toLowerCase().includes(term) ||
    p.email?.toLowerCase().includes(term) ||
    p.company_name?.toLowerCase().includes(term) ||
    p.phone?.includes(term)
  );

  const filteredGuests = guests.filter(g =>
    !term ||
    g.name?.toLowerCase().includes(term) ||
    g.email?.toLowerCase().includes(term) ||
    g.company_name?.toLowerCase().includes(term) ||
    g.phone?.includes(term)
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Søk på navn, e-post, telefon eller firma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Registrerte kunder */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Registrerte kunder ({filteredProfiles.length})
            </h3>
            {filteredProfiles.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Ingen treff</p>
            ) : (
              filteredProfiles.map(profile => (
                <CustomerCard
                  key={profile.id}
                  profile={profile}
                  onClick={() => setSelectedProfile(profile)}
                />
              ))
            )}
          </div>

          {/* Gjestekunder */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Gjestekunder ({filteredGuests.length})
            </h3>
            {filteredGuests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Ingen treff</p>
            ) : (
              filteredGuests.map(guest => (
                <Card
                  key={guest.email}
                  className="cursor-pointer interactive-card hover:border-primary/50"
                  onClick={() => setSelectedGuest({ email: guest.email, name: guest.type === 'business' ? (guest.company_name || guest.name) : guest.name })}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <UserX className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{guest.type === 'business' ? (guest.company_name || guest.name) : guest.name}</span>
                          <Badge variant="outline" className="text-xs text-muted-foreground">Gjest</Badge>
                          <Badge variant="secondary" className="text-xs">{guest.type === 'business' ? 'Bedrift' : 'Privat'}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />{guest.email}
                          </span>
                          {guest.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />{guest.phone}
                            </span>
                          )}
                          {guest.company_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />{guest.company_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(guest.latest_quote), { addSuffix: true, locale: nb })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      <CustomerDetailModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
      />

      <GuestCustomerModal
        email={selectedGuest?.email ?? null}
        name={selectedGuest?.name ?? null}
        open={!!selectedGuest}
        onClose={() => setSelectedGuest(null)}
      />
    </div>
  );
};
