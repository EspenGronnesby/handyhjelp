import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateGuestCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (guest: { email: string; name: string }) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CreateGuestCustomerModal = ({ open, onClose, onCreated }: CreateGuestCustomerModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customerType, setCustomerType] = useState<'private' | 'business'>('private');
  const [companyName, setCompanyName] = useState('');
  const [orgNumber, setOrgNumber] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCustomerType('private');
    setCompanyName('');
    setOrgNumber('');
    setDescription('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      onClose();
    }
  };

  const emailValid = EMAIL_REGEX.test(email.trim());
  const canSave =
    name.trim().length > 1 &&
    emailValid &&
    description.trim().length > 2 &&
    (customerType === 'private' || companyName.trim().length > 1);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('quotes').insert({
        user_id: null,
        type: customerType,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim() || null,
        company_name: customerType === 'business' ? companyName.trim() : null,
        org_number: customerType === 'business' ? orgNumber.trim() || null : null,
        description: description.trim(),
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Gjestekunde opprettet',
        description: `${name.trim()} er lagt til og kan nå få oppdrag og e-post.`,
      });

      onCreated?.({ email: email.trim().toLowerCase(), name: customerType === 'business' ? companyName.trim() : name.trim() });
      reset();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ukjent feil';
      toast({
        title: 'Feil',
        description: `Kunne ikke opprette gjestekunde: ${message}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Ny gjestekunde
          </DialogTitle>
          <DialogDescription>
            Legg inn en kunde som ikke har bestilt via nettsiden, slik at du kan opprette og avslutte oppdrag og sende e-post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Kundetype</Label>
            <RadioGroup
              value={customerType}
              onValueChange={(v) => setCustomerType(v as 'private' | 'business')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="guest-private" />
                <Label htmlFor="guest-private" className="text-sm font-normal cursor-pointer">Privat</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="guest-business" />
                <Label htmlFor="guest-business" className="text-sm font-normal cursor-pointer">Bedrift</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-name">Navn *</Label>
            <Input
              id="guest-name"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kundens navn"
            />
          </div>

          {customerType === 'business' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="guest-company">Firmanavn *</Label>
                <Input
                  id="guest-company"
                  value={companyName}
                  maxLength={150}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Firma AS"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guest-org">Org.nr</Label>
                <Input
                  id="guest-org"
                  value={orgNumber}
                  maxLength={20}
                  onChange={(e) => setOrgNumber(e.target.value)}
                  placeholder="123456789"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guest-email">E-post *</Label>
              <Input
                id="guest-email"
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kunde@example.com"
              />
              {email.length > 0 && !emailValid && (
                <p className="text-xs text-destructive">Ugyldig e-postadresse</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-phone">Telefon</Label>
              <Input
                id="guest-phone"
                value={phone}
                maxLength={30}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-address">Adresse</Label>
            <Input
              id="guest-address"
              value={address}
              maxLength={200}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Gateadresse, poststed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-description">Beskrivelse av oppdraget *</Label>
            <Textarea
              id="guest-description"
              value={description}
              maxLength={2000}
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hva gjelder oppdraget?"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              'Opprett gjestekunde'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
