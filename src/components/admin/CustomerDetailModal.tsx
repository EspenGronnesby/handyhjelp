import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Phone, Building2, FileText, Briefcase, CheckCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Quote, Job, ServiceAgreement, STATUS_LABELS, STATUS_COLORS, AGREEMENT_STATUS_LABELS, AGREEMENT_STATUS_COLORS } from '@/types/admin';
import { formatDistanceToNow, format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface CustomerDetailModalProps {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
}

export const CustomerDetailModal = ({ profile, open, onClose }: CustomerDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agreements, setAgreements] = useState<ServiceAgreement[]>([]);

  useEffect(() => {
    if (profile && open) {
      fetchCustomerData();
    }
  }, [profile, open]);

  const fetchCustomerData = async () => {
    if (!profile) return;
    setLoading(true);
    
    try {
      // Fetch quotes for this customer
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      // Fetch jobs for this customer
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, quotes(name, email, phone, description, type, company_name, org_number)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      // Fetch service agreements for this customer
      const { data: agreementsData } = await supabase
        .from('service_agreements')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      setQuotes(quotesData || []);
      setJobs(jobsData || []);
      setAgreements((agreementsData || []).map(a => ({
        ...a,
        services: Array.isArray(a.services) ? a.services : []
      })) as ServiceAgreement[]);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const pendingQuotes = quotes.filter(q => q.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');

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

        {/* Customer Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
            {profile.org_number && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Org.nr: {profile.org_number}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Registrert {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: nb })}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="quotes" className="mt-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="quotes" className="text-xs sm:text-sm">
                Forespørsler ({pendingQuotes.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm">
                Aktive ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Fullført ({completedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="agreements" className="text-xs sm:text-sm">
                Avtaler ({agreements.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Quotes */}
            <TabsContent value="quotes" className="space-y-3 mt-4">
              {pendingQuotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Ingen ventende forespørsler</p>
              ) : (
                pendingQuotes.map(quote => (
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

            {/* Active Jobs */}
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
                            <Badge variant="secondary">{job.quotes?.type}</Badge>
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

            {/* Completed Jobs */}
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
                            <Badge variant="secondary">{job.quotes?.type}</Badge>
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

            {/* Service Agreements */}
            <TabsContent value="agreements" className="space-y-3 mt-4">
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
                          <p className="text-sm mt-2">📍 {agreement.address}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {agreement.frequency} • {agreement.contract_duration}
                          </p>
                          {agreement.services.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agreement.services.slice(0, 3).map((service, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                              {agreement.services.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agreement.services.length - 3}
                                </Badge>
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
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
