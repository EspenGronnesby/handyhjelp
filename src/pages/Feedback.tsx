import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function Feedback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    comment: '',
  });

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast({
        title: 'Velg en vurdering',
        description: 'Vennligst velg hvor fornøyd du er (1-5 stjerner)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Store feedback in a general feedback mechanism
      // For now, we'll create a notification to admin
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
        .limit(1);

      if (admins && admins.length > 0) {
        await supabase.from('notifications').insert({
          user_id: admins[0].user_id,
          type: 'feedback',
          title: 'Ny generell tilbakemelding',
          message: `${formData.name || 'Anonym'} (${formData.email || 'ingen e-post'}) ga ${formData.rating} stjerner: "${formData.comment}"`,
        });
      }

      setSubmitted(true);
      toast({
        title: 'Takk for tilbakemeldingen!',
        description: 'Vi setter stor pris på at du tok deg tid til å gi oss din mening.',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke sende tilbakemeldingen. Prøv igjen senere.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Takk for tilbakemeldingen | HandyHjelp</title>
        </Helmet>
        <Header />
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="container max-w-lg mx-auto px-4">
            <Card className="text-center">
              <CardContent className="pt-12 pb-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold mb-4">Takk for tilbakemeldingen!</h1>
                <p className="text-muted-foreground mb-6">
                  Din mening betyr mye for oss og hjelper oss å bli bedre.
                </p>
                <Button onClick={() => navigate('/')}>
                  Tilbake til forsiden
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gi oss tilbakemelding | HandyHjelp</title>
        <meta name="description" content="Del din opplevelse med HandyHjelp. Vi setter pris på din tilbakemelding." />
      </Helmet>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container max-w-lg mx-auto px-4">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Gi oss tilbakemelding</CardTitle>
              <CardDescription>
                Din mening er viktig for oss! Fortell oss om din opplevelse med HandyHjelp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="space-y-2">
                  <Label>Hvor fornøyd er du? *</Label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= formData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    {formData.rating === 0 && 'Klikk for å vurdere'}
                    {formData.rating === 1 && 'Veldig misfornøyd'}
                    {formData.rating === 2 && 'Misfornøyd'}
                    {formData.rating === 3 && 'Nøytral'}
                    {formData.rating === 4 && 'Fornøyd'}
                    {formData.rating === 5 && 'Veldig fornøyd'}
                  </p>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Din tilbakemelding *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Fortell oss om din opplevelse..."
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                {/* Name (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="name">Navn (valgfritt)</Label>
                  <Input
                    id="name"
                    placeholder="Ditt navn"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Email (optional) */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-post (valgfritt)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="din@epost.no"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Oppgi e-post hvis du ønsker at vi skal kontakte deg angående tilbakemeldingen.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sender...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send tilbakemelding
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
