import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface FeedbackData {
  id: string;
  rating: string | null;
  created_at: string;
  token_used_at: string | null;
  job_id: string;
  job?: {
    quote_id: string;
    quote?: {
      name: string;
      company_name: string | null;
      type: string;
    };
  };
}

interface FeedbackStats {
  happy: number;
  neutral: number;
  sad: number;
  pending: number;
  total: number;
}

const EMOJI_CONFIG = {
  happy: { emoji: '😊', label: 'Fornøyd', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  neutral: { emoji: '😐', label: 'Nøytral', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  sad: { emoji: '😟', label: 'Misfornøyd', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  pending: { emoji: '⏳', label: 'Venter', color: 'bg-muted text-muted-foreground' },
};

export const QuickFeedbackStats = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({ happy: 0, neutral: 0, sad: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('quick_feedback')
        .select(`
          id,
          rating,
          created_at,
          token_used_at,
          job_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch job and quote data separately
      const feedbackWithDetails: FeedbackData[] = [];
      for (const feedback of data || []) {
        const { data: jobData } = await supabase
          .from('jobs')
          .select('quote_id')
          .eq('id', feedback.job_id)
          .single();

        let quoteData = null;
        if (jobData?.quote_id) {
          const { data: quote } = await supabase
            .from('quotes')
            .select('name, company_name, type')
            .eq('id', jobData.quote_id)
            .single();
          quoteData = quote;
        }

        feedbackWithDetails.push({
          ...feedback,
          job: jobData ? {
            quote_id: jobData.quote_id,
            quote: quoteData || undefined
          } : undefined
        });
      }

      setFeedbackList(feedbackWithDetails);

      // Calculate stats
      const newStats: FeedbackStats = { happy: 0, neutral: 0, sad: 0, pending: 0, total: feedbackWithDetails.length };
      feedbackWithDetails.forEach(f => {
        if (!f.rating) {
          newStats.pending++;
        } else if (f.rating === 'happy') {
          newStats.happy++;
        } else if (f.rating === 'neutral') {
          newStats.neutral++;
        } else if (f.rating === 'sad') {
          newStats.sad++;
        }
      });
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (count: number) => {
    const answered = stats.total - stats.pending;
    if (answered === 0) return 0;
    return Math.round((count / answered) * 100);
  };

  const answeredCount = stats.total - stats.pending;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-2xl">{EMOJI_CONFIG.happy.emoji}</span>
              Fornøyde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.happy}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(stats.happy)}% av besvarte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-2xl">{EMOJI_CONFIG.neutral.emoji}</span>
              Nøytrale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.neutral}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(stats.neutral)}% av besvarte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-2xl">{EMOJI_CONFIG.sad.emoji}</span>
              Misfornøyde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.sad}</div>
            <p className="text-xs text-muted-foreground">{getPercentage(stats.sad)}% av besvarte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <span className="text-2xl">{EMOJI_CONFIG.pending.emoji}</span>
              Venter på svar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">av {stats.total} totalt</p>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Bar */}
      {answeredCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tilfredshetsoversikt</CardTitle>
            <CardDescription>{answeredCount} besvarte tilbakemeldinger</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-8 rounded-full overflow-hidden flex bg-muted">
              {stats.happy > 0 && (
                <div 
                  className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{ width: `${getPercentage(stats.happy)}%` }}
                >
                  {getPercentage(stats.happy) > 10 && `${getPercentage(stats.happy)}%`}
                </div>
              )}
              {stats.neutral > 0 && (
                <div 
                  className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{ width: `${getPercentage(stats.neutral)}%` }}
                >
                  {getPercentage(stats.neutral) > 10 && `${getPercentage(stats.neutral)}%`}
                </div>
              )}
              {stats.sad > 0 && (
                <div 
                  className="bg-red-500 flex items-center justify-center text-white text-xs font-medium transition-all"
                  style={{ width: `${getPercentage(stats.sad)}%` }}
                >
                  {getPercentage(stats.sad) > 10 && `${getPercentage(stats.sad)}%`}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Fornøyd
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Nøytral
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Misfornøyd
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Siste tilbakemeldinger</CardTitle>
          <CardDescription>Emoji-tilbakemeldinger sendt rett etter fullført jobb</CardDescription>
        </CardHeader>
        <CardContent>
          {feedbackList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Ingen tilbakemeldinger ennå</p>
          ) : (
            <div className="space-y-3">
              {feedbackList.slice(0, 20).map((feedback) => (
                <div 
                  key={feedback.id} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {feedback.rating ? EMOJI_CONFIG[feedback.rating as keyof typeof EMOJI_CONFIG]?.emoji : EMOJI_CONFIG.pending.emoji}
                    </div>
                    <div>
                      <p className="font-medium">
                        {feedback.job?.quote?.company_name || feedback.job?.quote?.name || 'Ukjent kunde'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {feedback.job?.quote?.type || 'Ukjent tjeneste'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="secondary" 
                      className={feedback.rating ? EMOJI_CONFIG[feedback.rating as keyof typeof EMOJI_CONFIG]?.color : EMOJI_CONFIG.pending.color}
                    >
                      {feedback.rating ? EMOJI_CONFIG[feedback.rating as keyof typeof EMOJI_CONFIG]?.label : 'Venter'}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(feedback.created_at), 'dd. MMM yyyy', { locale: nb })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
