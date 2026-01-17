import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Feedback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
  });

  const ratingLabels = ['', 'Dårlig', 'Kunne vært bedre', 'OK', 'Bra', 'Utmerket'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: 'Velg en vurdering',
        description: 'Vennligst velg antall stjerner',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Store feedback as notification to admin
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
          message: `${formData.name || 'Anonym'} (${formData.email || 'ingen e-post'}) ga ${rating} stjerner: "${formData.comment}"`,
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
          <title>Takk! | HandyHjelp</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Tusen takk! 🎉</h1>
              <p className="text-muted-foreground mb-2">Din tilbakemelding betyr veldig mye for oss.</p>
              <p className="text-sm text-muted-foreground mb-6">
                Vi bruker tilbakemeldinger til å forbedre våre tjenester.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-8 w-8",
                      star <= rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <Button onClick={() => navigate('/')}>Gå til forsiden</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gi oss tilbakemelding | HandyHjelp</title>
        <meta name="description" content="Del din opplevelse med HandyHjelp og hjelp oss å bli bedre." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/b938c0bf-4496-4b1f-8e38-fc4d96f22ae2.png" 
              alt="HandyHjelp" 
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Hei! 👋
            </h1>
            <p className="text-muted-foreground">
              Hvordan var din opplevelse med HandyHjelp?
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Din vurdering</CardTitle>
              <CardDescription>Velg antall stjerner</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      >
                        <Star
                          className={cn(
                            "h-12 w-12 transition-colors",
                            (hoveredRating || rating) >= star
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {(hoveredRating || rating) > 0 && (
                    <p className="text-sm font-medium text-foreground animate-fade-in">
                      {ratingLabels[hoveredRating || rating]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Fortell oss mer (valgfritt)
                  </label>
                  <Textarea
                    placeholder="Hva synes du om tjenestene våre? Har du forslag til forbedringer?"
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.comment.length}/500
                  </p>
                </div>

                {/* Name (optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Navn (valgfritt)
                  </label>
                  <Input
                    placeholder="Ditt navn"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {/* Email (optional) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    E-post (valgfritt)
                  </label>
                  <Input
                    type="email"
                    placeholder="din@epost.no"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Oppgi e-post hvis du ønsker at vi skal kontakte deg.
                  </p>
                </div>

                {/* Info box */}
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      Din tilbakemelding hjelper oss med å forbedre tjenestene våre. 
                      Vi setter stor pris på ærlige meninger!
                    </span>
                  </p>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sender...
                    </>
                  ) : (
                    'Send tilbakemelding'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Takk for at du valgte HandyHjelp! 💚
          </p>
        </div>
      </div>
    </>
  );
}
