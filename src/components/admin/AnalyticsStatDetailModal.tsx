import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Eye, MousePointerClick, ArrowRight, Loader2, Users, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAnalyticsOverview } from '@/hooks/useAnalyticsOverview';

export type AnalyticsStatType = 'visits' | 'conversionRate' | null;

const config = {
  visits: {
    title: 'Besøk siste 7 dager',
    icon: Eye,
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    chartColor: '#6366f1',
  },
  conversionRate: {
    title: 'Konverteringsrate siste 7 dager',
    icon: MousePointerClick,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    chartColor: '#10b981',
  },
} as const;

const PAGE_LABELS: Record<string, string> = {
  '/': 'Forside',
  '/tjenester': 'Tjenester',
  '/kontakt': 'Kontakt oss',
  '/om-oss': 'Om oss',
  '/tilbud': 'Be om tilbud',
  '/blogg': 'Blogg',
  '/prosjekter': 'Prosjekter',
  '/priser': 'Priser',
  '/garantier': 'Garantier',
  '/dashboard': 'Dashboard',
  '/dashboard/admin': 'Admin-panel',
  '/dashboard/worker': 'Arbeider-panel',
  '/dashboard/analytics': 'Analyse',
};

function friendlyPath(p: string) {
  return PAGE_LABELS[p] ?? p;
}

function friendlySource(source: string, medium: string): string | null {
  if (/[a-f0-9]{8}-[a-f0-9]{4}/.test(source)) return null;
  if (source.includes('lovable') || source.includes('preview--')) return null;
  if (source === '(direct)' || source === 'direct' || source === '(none)') return 'Direkte besøk';
  const knownSources: Record<string, string> = {
    google: 'Google',
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter / X',
    'x.com': 'Twitter / X',
    linkedin: 'LinkedIn',
    bing: 'Bing',
    youtube: 'YouTube',
  };
  const lower = source.toLowerCase();
  const known = Object.entries(knownSources).find(([k]) => lower.includes(k));
  const label = known ? known[1] : source.charAt(0).toUpperCase() + source.slice(1);
  if (medium && medium !== 'none' && medium !== '(none)' && medium !== 'referral') {
    return `${label} (${medium})`;
  }
  return label;
}

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

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className={`bg-gradient-to-br ${cfg.gradient} text-white p-6 rounded-t-lg`}>
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 rounded-lg bg-white/15">
                <Icon className="h-5 w-5" />
              </div>
              {cfg.title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-5">
            <div className="text-5xl font-bold tracking-tight">{headlineValue}</div>
            {data && (
              <div className="flex flex-wrap gap-3 mt-3">
                {type === 'visits' ? (
                  <>
                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{formatNumber(data.kpi.pageviews)} sidevisninger</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm">
                      <Users className="h-3.5 w-3.5" />
                      <span>{formatNumber(data.kpi.visitors)} unike besøkende</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{formatNumber(data.kpi.conversions)} henvendelser</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1 text-sm">
                      <Users className="h-3.5 w-3.5" />
                      <span>av {formatNumber(data.kpi.visitors)} besøkende</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading || !data ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Henter analyse…
            </div>
          ) : (
            <>
              {/* Graf */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {type === 'visits' ? 'Sidevisninger per dag' : 'Henvendelser per dag'}
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeseries} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={cfg.chartColor} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={cfg.chartColor} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickFormatter={formatDate}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        width={28}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 10,
                          fontSize: 12,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        }}
                        labelFormatter={(v) => formatDate(v as string)}
                        cursor={{ stroke: cfg.chartColor, strokeWidth: 1, strokeDasharray: '4 2' }}
                      />
                      <Area
                        type="monotone"
                        dataKey={type === 'visits' ? 'pageviews' : 'conversions'}
                        stroke={cfg.chartColor}
                        strokeWidth={2.5}
                        fill="url(#modGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: cfg.chartColor, strokeWidth: 0 }}
                        animationDuration={800}
                        name={type === 'visits' ? 'Sidevisninger' : 'Henvendelser'}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {type === 'visits' ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Mest besøkte sider */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Mest besøkte sider</h4>
                    <div className="space-y-3">
                      {data.topPages.slice(0, 5).map((p, i) => {
                        const label = friendlyPath(p.path);
                        const maxVisits = data.topPages[0]?.visits ?? 1;
                        const pct = Math.max(4, (p.visits / maxVisits) * 100);
                        return (
                          <div key={p.path} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                                <span className="font-medium truncate">{label}</span>
                              </span>
                              <span className="tabular-nums text-muted-foreground text-xs ml-2 shrink-0">
                                {formatNumber(p.visits)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: cfg.chartColor, opacity: 0.7 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {data.topPages.length === 0 && (
                        <p className="text-sm text-muted-foreground">Ingen sidedata ennå</p>
                      )}
                    </div>
                  </div>

                  {/* Hvor besøkende kommer fra */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Hvor besøkende kommer fra</h4>
                    <div className="space-y-3">
                      {(() => {
                        const filtered = data.sources
                          .map((s) => ({ ...s, label: friendlySource(s.source, s.medium) }))
                          .filter((s) => s.label !== null) as (typeof data.sources[0] & { label: string })[];
                        const maxVisitors = filtered[0]?.visitors ?? 1;
                        if (filtered.length === 0) {
                          return <p className="text-sm text-muted-foreground">Ingen kildedata ennå</p>;
                        }
                        return filtered.slice(0, 5).map((s, i) => {
                          const pct = Math.max(4, (s.visitors / maxVisitors) * 100);
                          return (
                            <div key={`${s.source}-${s.medium}`} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                                  <span className="font-medium truncate">{s.label}</span>
                                </span>
                                <span className="tabular-nums text-muted-foreground text-xs ml-2 shrink-0">
                                  {formatNumber(s.visitors)}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, background: '#10b981', opacity: 0.7 }}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                /* Konverteringer fordelt */
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Hva folk tar kontakt om</h4>
                  <div className="space-y-3">
                    {(() => {
                      const maxCount = data.conversionSources[0]?.count ?? 1;
                      return data.conversionSources.map((c, i) => {
                        const pct = Math.max(4, (c.count / maxCount) * 100);
                        return (
                          <div key={c.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                                <span className="font-medium">{c.name}</span>
                              </span>
                              <span className="tabular-nums text-muted-foreground text-xs ml-2 shrink-0">
                                {formatNumber(c.count)}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: cfg.chartColor, opacity: 0.7 }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                    {data.conversionSources.length === 0 && (
                      <p className="text-sm text-muted-foreground">Ingen henvendelser i perioden</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Link to="/dashboard/analytics" onClick={onClose}>
                  <Button variant="outline" className="w-full gap-2">
                    Se full analyse <ArrowRight className="h-4 w-4" />
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
