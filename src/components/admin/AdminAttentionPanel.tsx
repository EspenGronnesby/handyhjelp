import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, Receipt, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from '@/types/admin';
import { differenceInDays } from 'date-fns';

interface AdminAttentionPanelProps {
  pendingQuotes: Quote[];
  pendingContentCount: number;
}

export const AdminAttentionPanel = ({ pendingQuotes, pendingContentCount }: AdminAttentionPanelProps) => {
  const today = new Date().toISOString().split('T')[0];

  const { data: overdueInvoices } = useQuery({
    queryKey: ['overdue-invoices'],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('id')
        .lt('due_date', today)
        .neq('status', 'paid');
      return data?.length ?? 0;
    },
    staleTime: 60_000,
  });

  const oldPendingQuotes = pendingQuotes.filter(
    (q) => differenceInDays(new Date(), new Date(q.created_at)) > 3
  );

  const items = [
    oldPendingQuotes.length > 0 && {
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-500',
      message: `${oldPendingQuotes.length} forespørsel${oldPendingQuotes.length > 1 ? 'er' : ''} har ventet mer enn 3 dager`,
      link: '/dashboard/admin?category=oppdrag&tab=single-jobs',
      cta: 'Se forespørsler',
    },
    pendingContentCount > 0 && {
      icon: ClipboardList,
      gradient: 'from-fuchsia-500 to-purple-500',
      message: `${pendingContentCount} innlevering${pendingContentCount > 1 ? 'er' : ''} venter godkjenning`,
      link: '/dashboard/admin?category=innhold&tab=projects',
      cta: 'Se innhold',
    },
    (overdueInvoices ?? 0) > 0 && {
      icon: Receipt,
      gradient: 'from-rose-500 to-red-600',
      message: `${overdueInvoices} faktura${(overdueInvoices ?? 0) > 1 ? 'er' : ''} er forfalt`,
      link: '/dashboard/admin?category=okonomi&tab=invoices',
      cta: 'Se fakturaer',
    },
  ].filter(Boolean) as Array<{
    icon: typeof AlertTriangle;
    gradient: string;
    message: string;
    link: string;
    cta: string;
  }>;

  if (items.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Trenger oppmerksomhet
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.link} to={item.link}>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-border hover:bg-muted/40 transition-all duration-150 group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.gradient} shrink-0`}>
                  <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-sm text-foreground/80 flex-1 leading-tight">{item.message}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
