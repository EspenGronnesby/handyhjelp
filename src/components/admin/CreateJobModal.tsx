import { useState, useMemo } from 'react';
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
import { Profile } from '@/types/admin';
import { cn } from '@/lib/utils';

type JobAction = 'register' | 'start' | 'complete';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  profiles: Profile[];
  onCreateJob: (
    profile: Profile,
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
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [action, setAction] = useState<JobAction>('register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => {
    if (!searchQuery) return profiles;
    const query = searchQuery.toLowerCase();
    return profiles.filter(
      p => 
        p.email.toLowerCase().includes(query) ||
        p.full_name.toLowerCase().includes(query) ||
        (p.company_name && p.company_name.toLowerCase().includes(query)) ||
        (p.phone && p.phone.includes(query))
    );
  }, [profiles, searchQuery]);

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
            Opprett et oppdrag for en eksisterende kunde basert på henvendelse via telefon eller e-post.
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
                          key={profile.id}
                          value={profile.id}
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
                            <Check
                              className={cn(
                                "h-4 w-4",
                                selectedProfile?.id === profile.id ? "opacity-100" : "opacity-0"
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
