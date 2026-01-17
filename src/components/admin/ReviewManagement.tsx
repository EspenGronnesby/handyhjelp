import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, CheckCircle, XCircle, Clock, Search, Loader2, MessageSquare, User, Briefcase, EyeOff, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  job_id: string | null;
  user_id: string | null;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  feedback_type: string | null;
  profiles?: {
    full_name: string;
    email: string;
  };
  jobs?: {
    quotes?: {
      type: string;
      name: string;
    };
  };
}

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reviewId: string | null }>({ open: false, reviewId: null });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          job_id,
          user_id,
          rating,
          comment,
          status,
          created_at,
          approved_at,
          customer_name,
          customer_email,
          feedback_type
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch related data separately for reviews with job_id/user_id
      const reviewsWithRelations = await Promise.all(
        (data || []).map(async (review) => {
          let profiles = undefined;
          let jobs = undefined;
          
          if (review.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', review.user_id)
              .single();
            profiles = profileData || undefined;
          }
          
          if (review.job_id) {
            const { data: jobData } = await supabase
              .from('jobs')
              .select('quotes(type, name)')
              .eq('id', review.job_id)
              .single();
            jobs = jobData || undefined;
          }
          
          return { ...review, profiles, jobs };
        })
      );
      
      setReviews(reviewsWithRelations);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Feil ved henting av anmeldelser',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(reviewId);
    try {
      const updateData: { status: string; approved_at?: string | null; approved_by?: string | null } = {
        status: newStatus,
      };

      if (newStatus === 'approved') {
        const { data: { user } } = await supabase.auth.getUser();
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user?.id || null;
      }

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: newStatus, approved_at: updateData.approved_at || null }
            : review
        )
      );

      toast({
        title: newStatus === 'approved' ? 'Anmeldelse godkjent!' : 'Anmeldelse avvist',
        description: newStatus === 'approved' 
          ? 'Anmeldelsen er nå synlig på nettsiden' 
          : 'Anmeldelsen vil ikke bli publisert',
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: 'Feil ved oppdatering',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleHideReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: 'rejected' }
            : review
        )
      );

      toast({
        title: 'Anmeldelse skjult',
        description: 'Anmeldelsen er nå skjult fra nettsiden',
      });
    } catch (error) {
      console.error('Error hiding review:', error);
      toast({
        title: 'Feil ved skjuling',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(prev => prev.filter(review => review.id !== reviewId));

      toast({
        title: 'Anmeldelse slettet',
        description: 'Anmeldelsen er permanent slettet',
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Feil ved sletting',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setDeleteDialog({ open: false, reviewId: null });
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'vaktmester': return 'Vaktmester';
      case 'tomrer': return 'Tømrer';
      case 'blikk': return 'Blikk';
      case 'takrennerens': return 'Takrennerens';
      default: return type;
    }
  };

  const filterReviews = (status: string) => {
    return reviews
      .filter(review => review.status === status)
      .filter(review => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        const customerName = review.profiles?.full_name || review.jobs?.quotes?.name || '';
        const comment = review.comment || '';
        return customerName.toLowerCase().includes(searchLower) ||
               comment.toLowerCase().includes(searchLower);
      });
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

  const averageRating = reviews.filter(r => r.status === 'approved').length > 0
    ? (reviews.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.rating, 0) / approvedCount).toFixed(1)
    : '-';

  const ReviewCard = ({ review }: { review: Review }) => {
    const isGeneralFeedback = review.feedback_type === 'general';
    const customerName = isGeneralFeedback 
      ? (review.customer_name || 'Anonym') 
      : (review.profiles?.full_name || review.jobs?.quotes?.name || 'Ukjent kunde');
    const customerEmail = isGeneralFeedback ? review.customer_email : review.profiles?.email;
    const serviceType = review.jobs?.quotes?.type;

    return (
      <Card className={cn(
        "transition-all",
        review.status === 'pending' && "border-l-4 border-l-yellow-500",
        review.status === 'approved' && "border-l-4 border-l-green-500",
        review.status === 'rejected' && "border-l-4 border-l-red-500 opacity-60"
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Left side - Review content */}
            <div className="flex-1 space-y-3">
              {/* Customer info */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isGeneralFeedback ? "bg-blue-100 dark:bg-blue-900/30" : "bg-primary/10"
                )}>
                  {isGeneralFeedback ? (
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{customerName}</p>
                    {isGeneralFeedback && (
                      <Badge variant="secondary" className="text-xs">Generell</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {serviceType ? (
                      <>
                        <Briefcase className="h-3 w-3" />
                        <span>{getServiceTypeName(serviceType)}</span>
                        <span>•</span>
                      </>
                    ) : customerEmail ? (
                      <>
                        <span>{customerEmail}</span>
                        <span>•</span>
                      </>
                    ) : null}
                    <span>{formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: nb })}</span>
                  </div>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
              </div>

              {/* Comment */}
              {review.comment ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-sm text-foreground italic">"{review.comment}"</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Ingen kommentar</p>
              )}

              {/* Status badge */}
              {review.status === 'approved' && review.approved_at && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Godkjent {format(new Date(review.approved_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
                </p>
              )}
            </div>

            {/* Right side - Actions */}
            <div className="flex gap-2 md:flex-col">
              {review.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(review.id, 'approved')}
                    disabled={actionLoading === review.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Godkjenn
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(review.id, 'rejected')}
                    disabled={actionLoading === review.id}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Avvis
                  </Button>
                </>
              )}
              
              {review.status === 'approved' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleHideReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Skjul
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteDialog({ open: true, reviewId: review.id })}
                    disabled={actionLoading === review.id}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Slett
                  </Button>
                </>
              )}
              
              {review.status === 'rejected' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(review.id, 'approved')}
                    disabled={actionLoading === review.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading === review.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Godkjenn
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteDialog({ open: true, reviewId: review.id })}
                    disabled={actionLoading === review.id}
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Slett
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Venter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Godkjent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Avvist</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating}</p>
                <p className="text-sm text-muted-foreground">Snitt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Søk etter kunde eller kommentar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Venter ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Godkjent ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Avvist ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {filterReviews('pending').length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen anmeldelser venter på godkjenning</p>
                </CardContent>
              </Card>
            ) : (
              filterReviews('pending').map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            {filterReviews('approved').length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen godkjente anmeldelser ennå</p>
                </CardContent>
              </Card>
            ) : (
              filterReviews('approved').map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="space-y-4">
            {filterReviews('rejected').length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ingen avviste anmeldelser</p>
                </CardContent>
              </Card>
            ) : (
              filterReviews('rejected').map(review => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, reviewId: open ? deleteDialog.reviewId : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slette anmeldelse?</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette denne anmeldelsen permanent? Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.reviewId && handleDeleteReview(deleteDialog.reviewId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === deleteDialog.reviewId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Slett permanent'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewManagement;
