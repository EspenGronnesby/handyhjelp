import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ReviewSubmit = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jobData, setJobData] = useState<{
    id: string;
    userId: string;
    serviceType: string;
    customerName: string;
    completedDate: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Bot protection
  const [existingReview, setExistingReview] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      if (!jobId) {
        setError('Ugyldig lenke');
        setLoading(false);
        return;
      }

      try {
        // Fetch job with quote data
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id,
            user_id,
            completed_date,
            status,
            quotes!inner(
              id,
              name,
              type
            )
          `)
          .eq('id', jobId)
          .eq('status', 'completed')
          .single();

        if (jobError || !job) {
          setError('Jobben ble ikke funnet eller er ikke fullført ennå');
          setLoading(false);
          return;
        }

        // Check if review already exists
        const { data: existingReviewData } = await supabase
          .from('reviews')
          .select('id')
          .eq('job_id', jobId)
          .maybeSingle();

        if (existingReviewData) {
          setExistingReview(true);
          setLoading(false);
          return;
        }

        const quote = job.quotes as { id: string; name: string; type: string };
        const serviceType = quote.type === 'vaktmester' ? 'Vaktmestertjenester' :
                           quote.type === 'tomrer' ? 'Tømrertjenester' :
                           quote.type === 'blikk' ? 'Blikkenslagertjenester' :
                           quote.type === 'takrennerens' ? 'Takrennerens' : 'Tjenester';

        setJobData({
          id: job.id,
          userId: job.user_id,
          serviceType,
          customerName: quote.name,
          completedDate: job.completed_date || '',
        });
      } catch (err) {
        setError('Noe gikk galt. Prøv igjen senere.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleSubmit = async () => {
    // Bot protection: if honeypot is filled, silently reject
    if (honeypot) {
      setSubmitted(true);
      return;
    }
    
    if (rating === 0) {
      toast({
        title: 'Velg en vurdering',
        description: 'Vennligst velg antall stjerner',
        variant: 'destructive',
      });
      return;
    }

    if (!jobData) return;

    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          job_id: jobData.id,
          user_id: jobData.userId,
          rating,
          comment: comment.trim() || null,
          status: 'pending',
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      toast({
        title: 'Takk for din tilbakemelding!',
        description: 'Din anmeldelse er sendt og vil bli gjennomgått.',
      });
    } catch (err) {
      toast({
        title: 'Noe gikk galt',
        description: 'Kunne ikke sende anmeldelsen. Prøv igjen.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Dårlig', 'Kunne vært bedre', 'OK', 'Bra', 'Utmerket'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (existingReview) {
    return (
      <>
        <Helmet>
          <title>Allerede vurdert | HandyHjelp</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Du har allerede vurdert denne jobben</h1>
              <p className="text-muted-foreground mb-6">Takk for at du delte din opplevelse med oss!</p>
              <Button onClick={() => navigate('/')}>Gå til forsiden</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Feil | HandyHjelp</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Noe gikk galt</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/')}>Gå til forsiden</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

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
                Vi gjennomgår alle anmeldelser før de publiseres på nettsiden.
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
        <title>Del din opplevelse | HandyHjelp</title>
        <meta name="description" content="Del din opplevelse med HandyHjelp og hjelp andre kunder ta gode valg." />
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
              Hei {jobData?.customerName?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Hvordan var din opplevelse med {jobData?.serviceType}?
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Din vurdering</CardTitle>
              <CardDescription>Velg antall stjerner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Honeypot field - hidden from users, visible to bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] opacity-0 pointer-events-none"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
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
                  placeholder="Hva synes du om arbeidet vårt? Var du fornøyd med resultatet?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comment.length}/500
                </p>
              </div>

              {/* Info box */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <span>
                    Din anmeldelse vil bli gjennomgått før den eventuelt publiseres på vår nettside. 
                    Vi setter stor pris på ærlige tilbakemeldinger!
                  </span>
                </p>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={submitting || rating === 0}
                className="w-full h-12 text-base"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sender...
                  </>
                ) : (
                  'Send tilbakemelding'
                )}
              </Button>
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
};

export default ReviewSubmit;
