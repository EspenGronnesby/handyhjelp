import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Copy, Share2, Users, Loader2 } from 'lucide-react';

export const ReferralSection = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [usesCount, setUsesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralCode();
    }
  }, [user]);

  const fetchReferralCode = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('code, uses_count')
        .eq('referrer_user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching referral code:', error);
      } else if (data) {
        setReferralCode(data.code);
        setUsesCount(data.uses_count);
      } else {
        await createReferralCode();
      }
    } catch (error) {
      console.error('Error in fetchReferralCode:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    if (!user) return;

    const code = `HH${user.id.slice(0, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ referrer_user_id: user.id, code })
      .select()
      .single();

    if (error) {
      console.error('Error creating referral code:', error);
    } else if (data) {
      setReferralCode(data.code);
      setUsesCount(0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success('Kode kopiert!');
  };

  const handleShare = () => {
    const text = `Bli med meg på HandyHjelp og få 250 poeng! Bruk koden: ${referralCode}`;
    const url = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({ title: 'HandyHjelp', text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Invitasjon kopiert!');
    }
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) {
      toast.error('Vennligst skriv inn en kode');
      return;
    }

    setApplying(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-referral', {
        body: { referralCode: applyCode.trim() }
      });

      if (error) throw error;

      toast.success(data.message);
      setApplyCode('');
    } catch (error: any) {
      toast.error(error.message || 'Kunne ikke bruke kode');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Anbefal en venn
          </CardTitle>
          <CardDescription>
            Dere får begge 250 poeng når din venn bruker koden din! 🎁
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Din referansekode</Label>
            <div className="flex gap-2">
              <Input value={referralCode} readOnly className="font-mono text-lg" />
              <Button onClick={handleCopy} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={handleShare} variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">
              📊 <strong>{usesCount}</strong> {usesCount === 1 ? 'person har' : 'personer har'} brukt koden din
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Har du en kode?</CardTitle>
          <CardDescription>Bruk en venns referansekode og få 250 poeng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="Skriv inn kode"
              className="font-mono"
            />
            <Button onClick={handleApplyCode} disabled={applying || !applyCode.trim()}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Bruk'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
