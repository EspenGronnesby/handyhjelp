import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Phone, Building2, FileText, Briefcase, CheckCircle, Calendar, MapPin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Quote, Job, ServiceAgreement, STATUS_LABELS, STATUS_COLORS, AGREEMENT_STATUS_LABELS, AGREEMENT_STATUS_COLORS } from '@/types/admin';
import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface EmailLog {
  id: string;
  subject: string;
  content: string;
  recipient_email: string;
  recipient_name: string | null;
  template_name: string | null;
  sent_at: string | null;
  status: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: string;
  file_url: string | null;
  created_at: string;
}

interface CustomerDetailModalProps {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  paid: 'Betalt',
  unpaid: 'Ubetalt',
  overdue: 'Forfalt',
  pending: 'Venter',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-500',
  unpaid: 'bg-yellow-500',
  overdue: 'bg-red-500',
  pending: 'bg-blue-500',
};

export const CustomerDetailModal = ({ profile, open, onClose }: CustomerDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (profile && open) {
      fetchCustomerData();
    }
  }, [profile, open]);

  const fetchCustomerData = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      const [quotesRes, jobsRes, agreementsRes, emailsRes, invoicesRes] = await Promise.all([
        supabase
          .from('quotes')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('jobs')
          .select('*, quotes(name, email, phone, description, type, company_name, org_number)')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('service_agreements')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('email_logs')
          .select('id, subject, content, recipient_email, recipient_name, template_name, sent_at, status')
          .or(`recipient_email.eq.${profile.email},recipient_user_id.eq.${profile.id}`)
          .order('sent_at', { ascending: false }),

        supabase
          .from('invoices')
          .select('id, invoice_number, amount, due_date, status, file_url, created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false }),
      ]);

      setQuotes(quotesRes.data || []);
      setJobs(jobsRes.data || []);
      setAgreements(((agreementsRes.data || []).map(a => ({
        ...a,
        services: Array.isArray(a.services) ? a.services : []
      })) as ServiceAgreement[]));
      setEmails(emailsRes.data || []);
      setInvoices(invoicesRes.data || []);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const filteredJobs = jobFilter === 'all' ? jobs : jobs.filter(j => j.status === jobFilter);
  const totalRevenue = jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + (j.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {profile.full_name}
            <Badge variant="outline" className="ml-2">
              {profile.customer_type === 'business' ? 'Bedrift' : 'Privat'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Kompakt infoboks øverst */}
        <div className="bg-muted/50 rounded-lg px-4 py-3 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          {profile.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.company_name && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{profile.company_name}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="profil" className="mt-4">
            <TabsList className="h-auto flex-wrap gap-1 p-1 bg-muted/60 rounded-xl">
              <TabsTrigger value="profil" className="text-xs sm:text-sm rounded-lg">Profil</TabsTrigger>
              <TabsTrigger value="foresporsler" className="text-xs sm:text-sm rounded-lg">
                Forespørsler ({quotes.length})
              </TabsTrigger>
              <TabsTrigger value="jobber" className="text-xs sm:text-sm rounded-lg">
                Jobber ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="avtaler" className="text-xs sm:text-sm rounded-lg">
                Avtaler ({agreements.length})
              </TabsTrigger>
              <TabsTrigger value="epost" className="text-xs sm:text-sm rounded-lg">
                E-post ({emails.length})
              </TabsTrigger>
              <TabsTrigger value="fakturaer" className="text-xs sm:text-sm rounded-lg">
                Fakturaer ({invoices.length})
              </TabsTrigger>
            </TabsList>

            {/* Profil */}
            <TabsContent value="profil" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Navn</p>
                          <p className="font-medium">{profile.full_name || '–'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">E-post</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Telefon</p>
                          <p className="font-medium">{profile.phone || '–'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Adresse</p>
                          <p className="font-medium">{profile.address || '–'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Bedrift</p>
                          <p className="font-medium">{profile.company_name || '–'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Org.nr</p>
                          <p className="font-medium">{profile.org_number || '–'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Kundetype</p>
                          <p className="font-medium">{profile.customer_type === 'business' ? 'Bedrift' : 'Privat'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Registrert</p>
                          <p className="font-medium">
                            {format(new Date(profile.created_at), 'dd. MMMM yyyy', { locale: nb })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {totalRevenue > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground">Total omsetning</p>
                      <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString('nb-NO')} kr</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Forespørsler */}
            <TabsContent value="foresporsler" className="space-y-3 mt-4">
              {quotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen forespørsler</p>
              ) : (
                quotes.map(quote => (
                  <Card key={quote.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary">{quote.type === 'business' ? 'Bedrift' : 'Privat'}</Badge>
                            <Badge className={STATUS_COLORS[quote.status]}>{STATUS_LABELS[quote.status]}</Badge>
                          </div>
                          <p className="text-sm mt-2">{quote.description}</p>
                          {quote.address && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{quote.address}
                            </p>
                          )}
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

            {/* Jobber */}
            <TabsContent value="jobber" className="space-y-3 mt-4">
              <div className="flex gap-2">
                {(['all', 'in_progress', 'completed'] as const).map(f => (
                  <Button
                    key={f}
                    size="sm"
                    variant={jobFilter === f ? 'default' : 'outline'}
                    onClick={() => setJobFilter(f)}
                  >
                    {f === 'all' ? `Alle (${jobs.length})` : f === 'in_progress' ? `Aktive (${jobs.filter(j => j.status === 'in_progress').length})` : `Fullført (${jobs.filter(j => j.status === 'completed').length})`}
                  </Button>
                ))}
              </div>
              {filteredJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen jobber</p>
              ) : (
                filteredJobs.map(job => (
                  <Card key={job.id} className={`border-l-4 ${job.status === 'completed' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {job.status === 'completed'
                              ? <CheckCircle className="h-4 w-4 text-green-500" />
                              : <Briefcase className="h-4 w-4 text-blue-500" />}
                            <Badge className={job.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                              {job.status === 'completed' ? 'Fullført' : 'Pågår'}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2">{job.quotes?.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {job.status === 'completed' && job.completed_date
                              ? `Fullført ${format(new Date(job.completed_date), 'dd.MM.yyyy', { locale: nb })}`
                              : job.started_at
                              ? `Startet ${format(new Date(job.started_at), 'dd.MM.yyyy', { locale: nb })}`
                              : ''}
                          </p>
                        </div>
                        {(job.amount || 0) > 0 && (
                          <span className={`font-semibold ${job.status === 'completed' ? 'text-green-600' : 'text-primary'}`}>
                            {(job.amount || 0).toLocaleString('nb-NO')} kr
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Avtaler */}
            <TabsContent value="avtaler" className="space-y-3 mt-4">
              {agreements.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen serviceavtaler</p>
              ) : (
                agreements.map(agreement => (
                  <Card key={agreement.id} className={`border-l-4 ${agreement.status === 'contract_signed' ? 'border-l-green-500' : 'border-l-purple-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <Badge className={AGREEMENT_STATUS_COLORS[agreement.status] || 'bg-gray-500'}>
                              {AGREEMENT_STATUS_LABELS[agreement.status] || agreement.status}
                            </Badge>
                          </div>
                          <p className="text-sm mt-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{agreement.address}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {agreement.frequency} • {agreement.contract_duration}
                          </p>
                          {agreement.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agreement.services.slice(0, 3).map((service, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{service}</Badge>
                              ))}
                              {agreement.services.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{agreement.services.length - 3}</Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(agreement.created_at), 'dd.MM.yyyy', { locale: nb })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* E-post */}
            <TabsContent value="epost" className="space-y-3 mt-4">
              {emails.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen e-poster sendt til denne kunden</p>
              ) : (
                emails.map(email => (
                  <Card key={email.id}>
                    <CardContent className="pt-4">
                      <div
                        className="cursor-pointer"
                        onClick={() => setExpandedEmail(expandedEmail === email.id ? null : email.id)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{email.subject}</p>
                            {email.template_name && (
                              <p className="text-xs text-muted-foreground mt-0.5">Mal: {email.template_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              className={email.status === 'sent' ? 'bg-green-500' : email.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'}
                            >
                              {email.status === 'sent' ? 'Sendt' : email.status === 'failed' ? 'Feil' : email.status || 'Ukjent'}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {email.sent_at ? format(new Date(email.sent_at), 'dd.MM.yyyy', { locale: nb }) : '–'}
                            </span>
                            {expandedEmail === email.id
                              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                      </div>
                      {expandedEmail === email.id && (
                        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 rounded p-3 max-h-48 overflow-y-auto">
                          {email.content}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Fakturaer */}
            <TabsContent value="fakturaer" className="space-y-3 mt-4">
              {invoices.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen fakturaer</p>
              ) : (
                invoices.map(invoice => (
                  <Card key={invoice.id} className={`border-l-4 ${invoice.status === 'paid' ? 'border-l-green-500' : invoice.status === 'overdue' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">#{invoice.invoice_number}</p>
                            <Badge className={INVOICE_STATUS_COLORS[invoice.status] || 'bg-gray-500'}>
                              {INVOICE_STATUS_LABELS[invoice.status] || invoice.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Forfall: {format(new Date(invoice.due_date), 'dd.MM.yyyy', { locale: nb })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base">{invoice.amount.toLocaleString('nb-NO')} kr</span>
                          {invoice.file_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={invoice.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
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
