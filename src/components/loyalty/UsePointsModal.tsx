import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Gift, Copy, CheckCircle2 } from 'lucide-react';

interface UsePointsModalProps {
  open: boolean;
  onClose: () => void;
  currentBalance: number;
  getPointsValue: (points: number) => number;
}

export const UsePointsModal = ({ open, onClose, currentBalance, getPointsValue }: UsePointsModalProps) => {
  const [pointsToUse, setPointsToUse] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    const points = parseInt(pointsToUse);

    if (isNaN(points) || points < 200) {
      toast.error('Du må bruke minst 200 poeng');
      return;
    }

    if (points > currentBalance) {
      toast.error('Du har ikke nok poeng');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('apply-points-discount', {
        body: { pointsToUse: points }
      });

      if (error) throw error;

      setDiscountCode(data.discountCode);
      setShowSuccess(true);
      toast.success(data.message);
    } catch (error: any) {
      console.error('Error using points:', error);
      toast.error(error.message || 'Kunne ikke bruke poeng');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discountCode);
    toast.success('Rabattkode kopiert!');
  };

  const handleClose = () => {
    setPointsToUse('');
    setDiscountCode('');
    setShowSuccess(false);
    onClose();
  };

  const discountValue = pointsToUse ? getPointsValue(parseInt(pointsToUse) || 0) : 0;

  if (showSuccess && discountCode) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-center text-2xl">Poeng brukt!</DialogTitle>
            <DialogDescription className="text-center">
              Din rabattkode er klar til bruk
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Din rabattkode</p>
              <p className="text-2xl font-bold font-mono tracking-wider">{discountCode}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {discountValue} kr rabatt
              </p>
            </div>

            <Button onClick={handleCopyCode} className="w-full" variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Kopier kode
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Bruk denne koden ved neste bestilling for å få rabatten
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Ferdig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Bruk poeng
          </DialogTitle>
          <DialogDescription>
            Bytt poengene dine mot rabatt (100 poeng = 10 kr)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="points">Antall poeng</Label>
            <Input
              id="points"
              type="number"
              min="200"
              max={currentBalance}
              step="10"
              value={pointsToUse}
              onChange={(e) => setPointsToUse(e.target.value)}
              placeholder="Minimum 200 poeng"
            />
            <p className="text-sm text-muted-foreground">
              Tilgjengelig: {currentBalance.toLocaleString()} poeng
            </p>
          </div>

          {discountValue > 0 && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Du får</p>
              <p className="text-2xl font-bold">{discountValue} kr rabatt</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !pointsToUse || parseInt(pointsToUse) < 200}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Behandler...
              </>
            ) : (
              'Bruk poeng'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
