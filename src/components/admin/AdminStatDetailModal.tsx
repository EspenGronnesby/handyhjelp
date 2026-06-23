import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Briefcase, CheckCircle, Loader2, Calendar, Clock, Building2, User, Phone, ArrowRight } from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes, differenceInDays } from 'date-fns';
import { nb } from 'date-fns/locale';

export type StatCardType = 'customers' | 'quotes' | 'activeJobs' | 'completedJobs';

interface AdminStatDetailModalProps {
  type: StatCardType | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  customer_type: string | null;
  created_at: string;
}

interface QuoteRow {
  id: string;
  name: string;
  phone: string | null;
  description: string;
  type: string;
  created_at: string;
}

interface ActiveJobRow {
  id: string;
  status: string;
  scheduled_date: string | null;
  started_at: string | null;
  quotes: { name: string; description: string; type: string; phone: string | null } | null;
}

interface InvoiceRow {
  status: string;
  amount: number | null;
}

interface CompletedJobRow {
  id: string;
  completed_date: string | null;
  created_at: string;
  quotes: { name: string; description: string } | null;
  invoices: InvoiceRow[] | null;
}

const config = {
  customers: {
    gradient: 'from-fuchsia-600 via-purple-600 to-indigo-700',
    icon: Users,
    title: 'Totale kunder',
    subtitle: 'Alle registrerte kunder',
    adminLink: '/dashboard/admin?category=brukere&tab=kunder',
  },
  quotes: {
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    icon: FileText,
    title: 'Åpne forespørsler',
    subtitle: 'Venter på svar',
    adminLink: '/dashboard/admin?category=oppdrag&tab=quotes',
  },
  activeJobs: {
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    icon: Briefcase,
    title: 'Aktive jobber',
    subtitle: 'Pågår akkurat nå',
    adminLink: '/dashboard/admin?category=oppdrag&tab=single-jobs',
  },
  completedJobs: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: CheckCircle,
    title: 'Fullførte jobber',
    subtitle: 'Ferdigstilte oppdrag',
    adminLink: '/dashboard/admin?category=oppdrag&tab=single-jobs&filter=completed',
  },
};

const statusLabel: Record<string, string> = {
  confirmed: 'Bekreftet',
  started: 'Startet',
  in_progress: 'Pågår',
};

const invoiceBadge: Record<string, { label: string; className: string }> = {
  paid:    { label: 'Betalt',       className: 'bg-green-400/30 border-green-400/40 text-green-100' },
  unpaid:  { label: 'Ikke betalt',  className: 'bg-yellow-400/30 border-yellow-400/40 text-yellow-100' },
  overdue: { label: 'Forfalt',      className: 'bg-red-400/30 border-red-400/40 text-red-100' },
  pending: { label: 'Venter',       className: 'bg-white/20 border-white/20 text-white/70' },
};

export function AdminStatDetailModal({ type, isOpen, onClose }: AdminStatDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJobRow[]>([]);
  const [completedJobs, setCompletedJobs] = useState<CompletedJobRow[]>([]);

  useEffect(() => {
    if (!isOpen || !type) return;

    // Reset ved hver åpning så gammel data ikke vises
    setCustomers([]); setQuotes([]); setActiveJobs([]); setCompletedJobs([]);

    const fetchModalData = async () => {
      setLoading(true);
      setError(false);
      try {
        if (type === 'customers') {
          // Hent IDs på ikke-kunder (admin/worker/owner) for å filtrere dem ut
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('user_id')
            .in('role', ['admin', 'platform_owner', 'worker', 'moderator']);
          const excludeIds = (roleData ?? []).map((r: any) => r.user_id as string);

          let query = supabase
            .from('profiles')
            .select('id, full_name, email, phone, customer_type, created_at')
            .order('created_at', { ascending: false });
          if (excludeIds.length > 0) {
            query = query.not('id', 'in', `(${excludeIds.join(',')})`);
          }
          const { data, error: err } = await query;
          if (err) throw err;
          setCustomers((data as CustomerRow[]) ?? []);
        } else if (type === 'quotes') {
          const { data, error: err } = await supabase
            .from('quotes')
            .select('id, name, phone, description, type, created_at')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
          if (err) throw err;
          setQuotes((data as QuoteRow[]) ?? []);
        } else if (type === 'activeJobs') {
          const { data, error: err } = await supabase
            .from('jobs')
            .select('id, status, scheduled_date, started_at, quotes(name, description, type, phone)')
            .in('status', ['confirmed', 'started', 'in_progress'])
            .order('started_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });
          if (err) throw err;
          setActiveJobs((data as unknown as ActiveJobRow[]) ?? []);
        } else if (type === 'completedJobs') {
          const { data, error: err } = await supabase
            .from('jobs')
            .select('id, completed_date, created_at, quotes(name, description), invoices(status, amount)')
            .eq('status', 'completed')
            .order('completed_date', { ascending: false, nullsFirst: false });
          if (err) throw err;
          setCompletedJobs((data as unknown as CompletedJobRow[]) ?? []);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModalData();
  }, [isOpen, type]);

  if (!type) return null;

  const cfg = config[type];
  const Icon = cfg.icon;
  const itemCount =
    type === 'customers' ? customers.length
    : type === 'quotes' ? quotes.length
    : type === 'activeJobs' ? activeJobs.length
    : completedJobs.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-lg w-full p-0 overflow-hidden border-0 bg-gradient-to-br ${cfg.gradient} shadow-2xl [&>button]:text-white/80 [&>button]:hover:bg-white/20 [&>button]:hover:text-white [&>button]:rounded-lg`}>
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                {cfg.title}
                {!loading && itemCount > 0 && (
                  <span className="text-sm font-semibold bg-white/25 text-white px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
                {type === 'activeJobs' && activeJobs.length > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                  </span>
                )}
              </DialogTitle>
              <p className="text-xs text-white/60 mt-0.5">{cfg.subtitle}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 text-white/70 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10 text-white/60">
              <p className="text-sm">Kunne ikke laste data. Prøv igjen.</p>
            </div>
          ) : (
            <>
              {/* Totale kunder */}
              {type === 'customers' && (
                <div className="space-y-2">
                  {customers.length === 0 ? (
                    <EmptyState text="Ingen kunder registrert ennå" />
                  ) : (
                    customers.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-white">
                            {(c.full_name ?? c.email ?? '?').slice(0, 1).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{c.full_name ?? 'Ukjent'}</p>
                          <p className="text-xs text-white/60 truncate">{c.email}</p>
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-white/50 hover:text-white mt-0.5 transition-colors w-fit">
                              <Phone className="h-3 w-3" />{formatPhone(c.phone)}
                            </a>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {c.customer_type === 'business' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                              <Building2 className="h-3 w-3" />Bedrift
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                              <User className="h-3 w-3" />Privat
                            </span>
                          )}
                          <p className="text-xs text-white/50 mt-1">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: nb })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Åpne forespørsler */}
              {type === 'quotes' && (
                <div className="space-y-2">
                  {quotes.length === 0 ? (
                    <EmptyState text="Ingen åpne forespørsler" />
                  ) : (
                    quotes.map((q) => (
                      <div key={q.id} className="p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white">{q.name}</p>
                          <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full shrink-0 ml-2">
                            {q.type === 'business' ? 'Bedrift' : 'Privat'}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 line-clamp-2 mb-2">{q.description}</p>
                        <div className="flex items-center justify-between">
                          {q.phone ? (
                            <a href={`tel:${q.phone}`} className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors">
                              <Phone className="h-3 w-3" />{formatPhone(q.phone)}
                            </a>
                          ) : <span />}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-[#FF0000]" />
                            <span className="text-xs font-bold text-[#FF0000]">
                              Ventet i {formatWaitTime(q.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Aktive jobber */}
              {type === 'activeJobs' && (
                <div className="space-y-2">
                  {activeJobs.length === 0 ? (
                    <EmptyState text="Ingen aktive jobber for øyeblikket" />
                  ) : (
                    activeJobs.map((j) => (
                      <div key={j.id} className="p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white">{j.quotes?.name ?? 'Ukjent kunde'}</p>
                          <span className="inline-flex items-center gap-1.5 text-xs bg-green-400/30 border border-green-400/40 text-green-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
                            </span>
                            {statusLabel[j.status] ?? j.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 line-clamp-2 mb-2">{j.quotes?.description}</p>
                        <div className="flex items-center justify-between text-white/50">
                          {j.quotes?.phone ? (
                            <a href={`tel:${j.quotes.phone}`} className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors">
                              <Phone className="h-3 w-3" />{formatPhone(j.quotes.phone)}
                            </a>
                          ) : <span />}
                          <div className="flex items-center gap-3">
                            {j.started_at && (
                              <span className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                Startet {formatDistanceToNow(new Date(j.started_at), { addSuffix: true, locale: nb })}
                              </span>
                            )}
                            {j.scheduled_date && (
                              <span className="flex items-center gap-1 text-xs">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(j.scheduled_date), 'd. MMM', { locale: nb })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Fullførte jobber */}
              {type === 'completedJobs' && (
                <div className="space-y-2">
                  {completedJobs.length === 0 ? (
                    <EmptyState text="Ingen fullførte jobber ennå" />
                  ) : (
                    completedJobs.map((j) => {
                      const invoice = j.invoices?.[0] ?? null;
                      const badge = invoice ? (invoiceBadge[invoice.status] ?? invoiceBadge.pending) : null;
                      return (
                        <div key={j.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                          <div className="p-2 rounded-lg bg-white/20 shrink-0">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{j.quotes?.name ?? 'Ukjent kunde'}</p>
                            <p className="text-xs text-white/60 truncate">{j.quotes?.description}</p>
                          </div>
                          <div className="text-right shrink-0 space-y-1">
                            <p className="text-xs text-white/50">
                              {j.completed_date
                                ? format(new Date(j.completed_date), 'd. MMM yyyy', { locale: nb })
                                : format(new Date(j.created_at), 'd. MMM yyyy', { locale: nb })}
                            </p>
                            {badge ? (
                              <>
                                <span className={`inline-flex text-xs px-2 py-0.5 rounded-full border ${badge.className}`}>
                                  {badge.label}
                                </span>
                                {invoice?.amount != null && (
                                  <p className="text-xs text-white/50">
                                    kr {invoice.amount.toLocaleString('nb-NO')}
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="inline-flex text-xs px-2 py-0.5 rounded-full border border-white/20 text-white/40">
                                Ingen faktura
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Se i Admin-knapp */}
              {!loading && !error && itemCount > 0 && (
                <Link to={cfg.adminLink} onClick={onClose}>
                  <button className="w-full mt-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    Se alle i Admin <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatPhone(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 8) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  return phone;
}

function formatWaitTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const days = differenceInDays(now, created);
  if (days >= 1) return `${days} dag${days !== 1 ? 'er' : ''}`;
  const hours = differenceInHours(now, created);
  if (hours >= 1) return `${hours} time${hours !== 1 ? 'r' : ''}`;
  const mins = differenceInMinutes(now, created);
  return `${Math.max(1, mins)} minutt${mins !== 1 ? 'er' : ''}`;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-white/50">
      <p className="text-sm">{text}</p>
    </div>
  );
}
