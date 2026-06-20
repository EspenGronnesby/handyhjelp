import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mail, UserX, Briefcase, CheckCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Quote, Job, STATUS_LABELS, STATUS_COLORS } from '@/types/admin';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface EmailLog {
  id: string;
  subject: string;
  content: string;
  template_name: string | null;
  status: string;
  sent_at: string;
}

interface GuestCustomerModalProps {
  email: string | null;
  name: string | null;
  open: boolean;
  onClose: () => void;
}

export const GuestCustomerModal = ({ email, name, open, onClose }: GuestCustomerModalProps) => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (email && open) {
      fetchData();
    }
  }, [email, open]);

  const fetchData = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const [quotesRes, jobsRes, logsRes] = await Promise.all([
        supabase.from('quotes').select('*').eq('email', email).order('created_at', { ascending: false }),
        supabase.from('jobs').select('*, quotes(name, email, phone, description, type, company_name, org_number)').eq('customer_email', email).order('created_at', { ascending: false }),
        supabase.from('email_logs').select('id, subject, content, template_name, status, sent_at').eq('recipient_email', email).order('sent_at', { ascending: false }),
      ]);
      setQuotes(quotesRes.data || []);
      setJobs(jobsRes.data || []);
      setEmailLogs(logsRes.data || []);
    } catch (error) {
      console.error('Error fetching guest customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserX className="h-5 w-5 text-muted-foreground" />
            {name || email}
            <Badge variant="outline" className="ml-2 text-muted-foreground">Gjestekunde</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{email}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ikke registrert som bruker — historikk søkt opp via e-post</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="quotes" className="mt-4">
            <TabsList className="grid grid-cols-4 w-full gap-1 p-1 bg-muted/60 rounded-xl h-auto">
              <TabsTrigger value="quotes" className="text-xs sm:text-sm rounded-lg border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
                Forespørsler ({quotes.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm rounded-lg border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
                Aktive ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm rounded-lg border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
                Fullført ({completedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="emails" className="text-xs sm:text-sm rounded-lg border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-transparent data-[state=inactive]:bg-card data-[state=inactive]:border-border/50 data-[state=inactive]:text-foreground/70 data-[state=inactive]:hover:border-border data-[state=inactive]:hover:text-foreground">
                E-poster ({emailLogs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quotes" className="space-y-3 mt-4">
              {quotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen forespørsler</p>
              ) : (
                quotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{quote.type}</Badge>
                            <Badge className={STATUS_COLORS[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
                          </div>
                          <p className="text-sm mt-2">{quote.description}</p>
                          {quote.address && <p className="text-xs text-muted-foreground mt-1">📍 {quote.address}</p>}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(quote.created_at), 'dd.MM.yyyy', { locale: nb })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-3 mt-4">
              {activeJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen aktive jobber</p>
              ) : (
                activeJobs.map(job => (
                  <Card key={job.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-blue-500" />
                            <Badge className="bg-blue-500">Pågår</Badge>
                          </div>
                          <p className="text-sm mt-2">{job.quotes?.description}</p>
                          {job.started_at && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Startet {format(new Date(job.started_at), 'dd.MM.yyyy', { locale: nb })}
                            </p>
                          )}
                        </div>
                        {job.amount > 0 && (
                          <span className="font-semibold text-primary">{job.amount.toLocaleString()} kr</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-3 mt-4">
              {completedJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen fullførte jobber</p>
              ) : (
                completedJobs.map(job => (
                  <Card key={job.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <Badge className="bg-green-500">Fullført</Badge>
                          </div>
                          <p className="text-sm mt-2">{job.quotes?.description}</p>
                          {job.completed_date && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Fullført {format(new Date(job.completed_date), 'dd.MM.yyyy', { locale: nb })}
                            </p>
                          )}
                        </div>
                        {job.amount > 0 && (
                          <span className="font-semibold text-green-600">{job.amount.toLocaleString()} kr</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="emails" className="space-y-3 mt-4">
              {emailLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen e-poster registrert</p>
              ) : (
                emailLogs.map(log => (
                  <Card
                    key={log.id}
                    className="border-l-4 border-l-cyan-500 cursor-pointer"
                    onClick={() => setExpandedEmail(expandedEmail === log.id ? null : log.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Send className="h-4 w-4 text-cyan-500" />
                            <Badge variant={log.status === 'sent' ? 'default' : 'destructive'}>
                              {log.status === 'sent' ? 'Sendt' : 'Feilet'}
                            </Badge>
                            {log.template_name && (
                              <Badge variant="outline" className="text-xs">{log.template_name}</Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-1">{log.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.sent_at), 'dd.MM.yyyy HH:mm', { locale: nb })}
                          </span>
                          {expandedEmail === log.id
                            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                      {expandedEmail === log.id && (
                        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded p-3 max-h-64 overflow-y-auto">
                          {log.content}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
