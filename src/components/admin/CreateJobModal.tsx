import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, User, Building2, Mail, Phone, MapPin, Check, ChevronsUpDown } from 'lucide-react';
import { Profile, JobCustomer } from '@/types/admin';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type JobAction = 'register' | 'start' | 'complete';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  profiles: Profile[];
  onCreateJob: (
    profile: JobCustomer,
    description: string,
    address: string | null,
    action: JobAction
  ) => Promise<void>;
}

export const CreateJobModal = ({ 
  open, 
  onClose, 
  profiles, 
  onCreateJob 
}: CreateJobModalProps) => {
  const [selectedProfile, setSelectedProfile] = useState<JobCustomer | null>(null);
  const [guests, setGuests] = useState<JobCustomer[]>([]);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [action, setAction] = useState<JobAction>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hent gjestekunder (henvendelser uten bruker) når modalen åpnes
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('quotes')
        .select('name, email, company_name, org_number, phone, type, address, created_at')
        .is('user_id', null)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      const seen = new Map<string, JobCustomer>();
      for (const q of data || []) {
        if (!seen.has(q.email)) {
          seen.set(q.email, {
            id: null,
            full_name: q.name,
            email: q.email,
            phone: q.phone,
            address: q.address,
            customer_type: q.type,
            company_name: q.company_name,
            org_number: q.org_number,
          });
        }
      }
      setGuests(Array.from(seen.values()));
    })();
    return () => { cancelled = true; };
  }, [open]);

  const allCustomers: JobCustomer[] = useMemo(() => {
    const registered: JobCustomer[] = profiles.map(p => ({ ...p }));
    const registeredEmails = new Set(registered.map(p => p.email.toLowerCase()));
    return [...registered, ...guests.filter(g => !registeredEmails.has(g.email.toLowerCase()))];
  }, [profiles, guests]);

  // Filter customers based on search query
  const filteredProfiles = useMemo(() => {
    const list = allCustomers;
    if (!searchQuery) return list;
    const query = searchQuery.toLowerCase();
    return list.filter(
      p => 
        p.email.toLowerCase().includes(query) ||
        p.full_name.toLowerCase().includes(query) ||
        (p.company_name && p.company_name.toLowerCase().includes(query)) ||
        (p.phone && p.phone.includes(query))
    );
  }, [allCustomers, searchQuery]);

  const handleSubmit = async () => {
    if (!selectedProfile || !description.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCreateJob(
        selectedProfile,
        description.trim(),
        address.trim() || null,
        action
      );
      handleReset();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedProfile(null);
    setDescription('');
    setAddress('');
    setAction('register');
    setSearchQuery('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Opprett oppdrag manuelt</DialogTitle>
          <DialogDescription>
            Opprett et oppdrag for en registrert kunde eller en gjestekunde, basert på henvendelse via telefon eller e-post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Search */}
          <div className="space-y-2">
            <Label>Velg kunde *</Label>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={searchOpen}
                  className="w-full justify-between"
                >
                  {selectedProfile ? (
                    <span className="truncate">
                      {selectedProfile.customer_type === 'business' 
                        ? selectedProfile.company_name 
                        : selectedProfile.full_name}
                      <span className="text-muted-foreground ml-2">
                        ({selectedProfile.email})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Søk etter kunde...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Søk på navn, e-post eller telefon..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>Ingen kunder funnet.</CommandEmpty>
                    <CommandGroup>
                      {filteredProfiles.slice(0, 10).map((profile) => (
                        <CommandItem
                          key={profile.email}
                          value={`${profile.full_name} ${profile.email}`}
                          onSelect={() => {
                            setSelectedProfile(profile);
                            setSearchOpen(false);
                            // Pre-fill address if available
                            if (profile.address && !address) {
                              setAddress(profile.address);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {profile.customer_type === 'business' ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {profile.customer_type === 'business' 
                                  ? profile.company_name 
                                  : profile.full_name}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {profile.email}
                              </div>
                            </div>
                            {!profile.id && (
                              <Badge variant="outline" className="text-[10px]">Gjest</Badge>
                            )}
                            <div className="hidden">
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedProfile?.email === profile.email ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Customer Info */}
          {selectedProfile && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  {selectedProfile.customer_type === 'business' ? (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {selectedProfile.customer_type === 'business' 
                      ? selectedProfile.company_name 
                      : selectedProfile.full_name}
                  </span>
                  <Badge variant="outline">
                    {selectedProfile.customer_type === 'business' ? 'Bedrift' : 'Privat'}
                  </Badge>
                  {!selectedProfile.id && (
                    <Badge variant="secondary" className="text-xs">Gjestekunde</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedProfile.email}
                </div>
                {selectedProfile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {selectedProfile.phone}
                  </div>
                )}
                {selectedProfile.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedProfile.address}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Oppdragsbeskrivelse *</Label>
            <Textarea
              id="description"
              placeholder="Beskriv oppdraget..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse (valgfritt)</Label>
            <Input
              id="address"
              placeholder="Adresse for oppdraget"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Handling ved opprettelse</Label>
            <RadioGroup value={action} onValueChange={(value) => setAction(value as JobAction)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="register" id="register" />
                <Label htmlFor="register" className="text-sm font-normal cursor-pointer">
                  Bare registrer oppdraget (ingen e-post)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="start" id="start" />
                <Label htmlFor="start" className="text-sm font-normal cursor-pointer">
                  Start oppdraget umiddelbart (sender e-post til kunden)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complete" id="complete" />
                <Label htmlFor="complete" className="text-sm font-normal cursor-pointer">
                  Avslutt oppdraget umiddelbart (sender fullført-e-post til kunden)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedProfile || !description.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oppretter...
              </>
            ) : (
              'Opprett oppdrag'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
