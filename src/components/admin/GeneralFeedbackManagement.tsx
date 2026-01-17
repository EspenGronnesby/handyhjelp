import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, CheckCircle, XCircle, Clock, Search, Loader2, MessageSquare, User, Mail, Trash2 } from 'lucide-react';
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

interface GeneralFeedback {
  id: string;
  rating: number;
  comment: string | null;
  name: string | null;
  email: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
}

const GeneralFeedbackManagement = () => {
  const [feedback, setFeedback] = useState<GeneralFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; feedbackId: string | null }>({ open: false, feedbackId: null });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('general_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast({
        title: 'Feil ved henting av tilbakemeldinger',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleUpdateStatus = async (feedbackId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(feedbackId);
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
        .from('general_feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedback(prev => 
        prev.map(item => 
          item.id === feedbackId 
            ? { ...item, status: newStatus, approved_at: updateData.approved_at || null }
            : item
        )
      );

      toast({
        title: newStatus === 'approved' ? 'Tilbakemelding godkjent!' : 'Tilbakemelding avvist',
        description: newStatus === 'approved' 
          ? 'Tilbakemeldingen kan nå vises på nettsiden' 
          : 'Tilbakemeldingen vil ikke bli publisert',
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Feil ved oppdatering',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    setActionLoading(feedbackId);
    try {
      const { error } = await supabase
        .from('general_feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;

      setFeedback(prev => prev.filter(item => item.id !== feedbackId));

      toast({
        title: 'Tilbakemelding slettet',
        description: 'Tilbakemeldingen er permanent slettet',
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Feil ved sletting',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setDeleteDialog({ open: false, feedbackId: null });
    }
  };

  const filterFeedback = (status: string) => {
    let filtered = feedback.filter(item => item.status === status);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name?.toLowerCase() || '').includes(query) ||
        (item.email?.toLowerCase() || '').includes(query) ||
        (item.comment?.toLowerCase() || '').includes(query)
      );
    }
    
    return filtered;
  };

  const pendingFeedback = filterFeedback('pending');
  const approvedFeedback = filterFeedback('approved');
  const rejectedFeedback = filterFeedback('rejected');

  // Calculate stats
  const totalRating = feedback.filter(f => f.status === 'approved').reduce((sum, f) => sum + f.rating, 0);
  const avgRating = approvedFeedback.length > 0 ? (totalRating / approvedFeedback.length).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const FeedbackCard = ({ item }: { item: GeneralFeedback }) => (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Customer info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{item.name || 'Anonym'}</p>
                {item.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.email}
                  </p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= item.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">({item.rating}/5)</span>
            </div>

            {/* Comment */}
            {item.comment && (
              <div className="bg-muted/50 rounded-lg p-3 mb-3">
                <p className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span className="italic">"{item.comment}"</span>
                </p>
              </div>
            )}

            {/* Date */}
            <p className="text-xs text-muted-foreground">
              Mottatt {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: nb })}
              {' '}({format(new Date(item.created_at), 'dd.MM.yyyy HH:mm', { locale: nb })})
            </p>

            {item.approved_at && (
              <p className="text-xs text-green-600 mt-1">
                Godkjent {format(new Date(item.approved_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {item.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(item.id, 'approved')}
                  disabled={actionLoading === item.id}
                  className="gap-1"
                >
                  {actionLoading === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Godkjenn
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateStatus(item.id, 'rejected')}
                  disabled={actionLoading === item.id}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Avvis
                </Button>
              </>
            )}
            
            {item.status === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                disabled={actionLoading === item.id}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Skjul
              </Button>
            )}

            {item.status === 'rejected' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(item.id, 'approved')}
                disabled={actionLoading === item.id}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Godkjenn
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteDialog({ open: true, feedbackId: item.id })}
              disabled={actionLoading === item.id}
              className="text-destructive hover:text-destructive gap-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{feedback.filter(f => f.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Venter</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{feedback.filter(f => f.status === 'approved').length}</p>
                <p className="text-sm text-muted-foreground">Godkjent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{feedback.filter(f => f.status === 'rejected').length}</p>
                <p className="text-sm text-muted-foreground">Avvist</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-sm text-muted-foreground">Snitt-rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Søk etter navn, e-post eller kommentar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Venter
            {pendingFeedback.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {pendingFeedback.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            Godkjent ({approvedFeedback.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            Avvist ({rejectedFeedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen tilbakemeldinger venter på godkjenning</p>
              </CardContent>
            </Card>
          ) : (
            pendingFeedback.map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approvedFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen godkjente tilbakemeldinger</p>
              </CardContent>
            </Card>
          ) : (
            approvedFeedback.map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedFeedback.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen avviste tilbakemeldinger</p>
              </CardContent>
            </Card>
          ) : (
            rejectedFeedback.map((item) => (
              <FeedbackCard key={item.id} item={item} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ open: false, feedbackId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett tilbakemelding</AlertDialogTitle>
            <AlertDialogDescription>
              Er du sikker på at du vil slette denne tilbakemeldingen permanent? Denne handlingen kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog.feedbackId && handleDeleteFeedback(deleteDialog.feedbackId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GeneralFeedbackManagement;
