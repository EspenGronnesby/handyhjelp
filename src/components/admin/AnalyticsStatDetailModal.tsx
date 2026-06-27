import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Eye, MousePointerClick, ArrowRight, Loader2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAnalyticsOverview } from '@/hooks/useAnalyticsOverview';

export type AnalyticsStatType = 'visits' | 'conversionRate' | null;

const config = {
  visits: {
    title: 'Besøk (siste 7 dager)',
    icon: Eye,
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
  },
  conversionRate: {
    title: 'Konverteringsrate (siste 7 dager)',
    icon: MousePointerClick,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
  },
} as const;

function formatNumber(n: number) {
  return new Intl.NumberFormat('nb-NO').format(n);
}
function formatPercent(n: number) {
  return new Intl.NumberFormat('nb-NO', { style: 'percent', maximumFractionDigits: 1 }).format(n);
}
function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

interface Props {
  type: AnalyticsStatType;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsStatDetailModal({ type, isOpen, onClose }: Props) {
  const { data, isLoading } = useAnalyticsOverview(isOpen && type !== null);
  if (!type) return null;
  const cfg = config[type];
  const Icon = cfg.icon;

  const headlineValue = !data
    ? '—'
    : type === 'visits'
    ? formatNumber(data.kpi.pageviews)
    : formatPercent(data.kpi.conversionRate);

  const headlineSub = !data
    ? ''
    : type === 'visits'
    ? `${formatNumber(data.kpi.visitors)} unike besøkende`
    : `${formatNumber(data.kpi.conversions)} av ${formatNumber(data.kpi.visitors)} besøkende`;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className={`bg-gradient-to-br ${cfg.gradient} text-white p-6 rounded-t-lg`}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-white/15">
                <Icon className="h-5 w-5" />
              </div>
              {cfg.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="text-4xl font-bold tracking-tight">{headlineValue}</div>
            <div className="text-sm text-white/80 mt-1">{headlineSub}</div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {isLoading || !data ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Henter analyse…
            </div>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  {type === 'visits' ? 'Sidevisninger pr. dag' : 'Konverteringer pr. dag'}
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeseries} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={formatDate} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} width={32} />
                      <Tooltip
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                        labelFormatter={(v) => formatDate(v as string)}
                      />
                      <Area
                        type="monotone"
                        dataKey={type === 'visits' ? 'pageviews' : 'conversions'}
                        stroke="hsl(var(--primary))"
                        fill="url(#modGrad)"
                        name={type === 'visits' ? 'Sidevisninger' : 'Konverteringer'}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {type === 'visits' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Toppsider</h4>
                    <div className="space-y-1.5">
                      {data.topPages.slice(0, 5).map((p) => (
                        <div key={p.path} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs truncate mr-2">{p.path}</span>
                          <span className="tabular-nums text-muted-foreground">{formatNumber(p.visits)}</span>
                        </div>
                      ))}
                      {data.topPages.length === 0 && <p className="text-xs text-muted-foreground">Ingen data</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Topp kilder</h4>
                    <div className="space-y-1.5">
                      {data.sources.slice(0, 5).map((s) => (
                        <div key={`${s.source}-${s.medium}`} className="flex items-center justify-between text-sm">
                          <span className="truncate mr-2">
                            {s.source}
                            <span className="text-xs text-muted-foreground ml-1">/ {s.medium}</span>
                          </span>
                          <span className="tabular-nums text-muted-foreground">{formatNumber(s.visitors)}</span>
                        </div>
                      ))}
                      {data.sources.length === 0 && <p className="text-xs text-muted-foreground">Ingen data</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Konverteringer fordelt</h4>
                  <div className="space-y-1.5">
                    {data.conversionSources.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm">
                        <span>{c.name}</span>
                        <span className="tabular-nums text-muted-foreground">{formatNumber(c.count)}</span>
                      </div>
                    ))}
                    {data.conversionSources.length === 0 && (
                      <p className="text-xs text-muted-foreground">Ingen konverteringer i perioden</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Link to="/dashboard/analytics" onClick={onClose}>
                  <Button variant="outline" className="w-full">
                    Se full analyse <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
