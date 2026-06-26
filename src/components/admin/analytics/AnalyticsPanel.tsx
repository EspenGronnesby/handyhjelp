import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownRight, ArrowUpRight, Eye, MousePointerClick, RefreshCw, Target, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type Summary = {
  range: { from: string; to: string };
  kpi: {
    pageviews: number;
    visitors: number;
    conversions: number;
    conversionRate: number;
    prev: { pageviews: number; visitors: number; conversions: number };
  };
  timeseries: { day: string; pageviews: number; conversions: number; visitors: number }[];
  sources: { source: string; medium: string; visitors: number; conversions: number }[];
  countries: { country: string; visits: number }[];
  devices: { device: string; count: number }[];
  topPages: { path: string; visits: number; conversions: number }[];
  conversionSources: { name: string; count: number }[];
  funnel: { step: string; count: number }[];
  recent: {
    occurred_at: string;
    event_name: string;
    path: string | null;
    source: string;
    medium: string;
    country: string | null;
    device: string | null;
    name: string | null;
    email: string | null;
  }[];
};

const RANGE_OPTIONS = [
  { value: '7', label: '7 dager' },
  { value: '30', label: '30 dager' },
  { value: '90', label: '90 dager' },
];

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted-foreground))'];

const COUNTRY_NAMES: Record<string, string> = {
  NO: '🇳🇴 Norge',
  SE: '🇸🇪 Sverige',
  DK: '🇩🇰 Danmark',
  FI: '🇫🇮 Finland',
  GB: '🇬🇧 Storbritannia',
  US: '🇺🇸 USA',
  DE: '🇩🇪 Tyskland',
  '??': '🌐 Ukjent',
};

const EVENT_LABELS: Record<string, string> = {
  quote_submitted: 'Tilbudsforespørsel',
  agreement_submitted: 'Avtaleforespørsel',
  quick_callback_submitted: 'Ring meg opp',
  phone_click: 'Telefonklikk',
  quote_cta: 'Tilbud-CTA',
};

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

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'nå';
  if (min < 60) return `${min} min siden`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} t siden`;
  const d = Math.floor(h / 24);
  return `${d} d siden`;
}

function delta(curr: number, prev: number): { value: number; positive: boolean; show: boolean } {
  if (!prev && !curr) return { value: 0, positive: true, show: false };
  if (!prev) return { value: 1, positive: true, show: true };
  const v = (curr - prev) / prev;
  return { value: Math.abs(v), positive: v >= 0, show: true };
}

function KpiCard({
  label,
  value,
  prev,
  icon: Icon,
  formatter = formatNumber,
}: {
  label: string;
  value: number;
  prev: number;
  icon: React.ComponentType<{ className?: string }>;
  formatter?: (n: number) => string;
}) {
  const d = delta(value, prev);
  return (
    <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        {d.show && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded',
              d.positive ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'
            )}
          >
            {d.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {formatPercent(d.value)}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight">{formatter(value)}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}

function HorizontalBar({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

export const AnalyticsPanel = () => {
  const [range, setRange] = useState('30');
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - parseInt(range, 10));
      const { data: res, error } = await supabase.functions.invoke('analytics-summary', {
        body: { from: from.toISOString(), to: to.toISOString() },
      });
      if (error) throw error;
      setData(res as Summary);
    } catch (e: any) {
      setErr(e?.message || 'Kunne ikke laste analyse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const maxSourceVisitors = useMemo(
    () => (data?.sources?.length ? Math.max(...data.sources.map((s) => s.visitors)) : 0),
    [data]
  );
  const maxCountry = useMemo(
    () => (data?.countries?.length ? Math.max(...data.countries.map((c) => c.visits)) : 0),
    [data]
  );
  const maxPage = useMemo(
    () => (data?.topPages?.length ? Math.max(...data.topPages.map((p) => p.visits)) : 0),
    [data]
  );
  const maxFunnel = data?.funnel?.[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Header / controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Analyse</h2>
          <p className="text-sm text-muted-foreground">
            Hvor kommer henvendelsene fra og hva konverterer?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={range} onValueChange={setRange}>
            <TabsList className="bg-muted/60">
              {RANGE_OPTIONS.map((o) => (
                <TabsTrigger key={o.value} value={o.value} className="text-xs">
                  {o.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {err && (
        <Card className="p-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
          {err}
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
        ) : (
          <>
            <KpiCard label="Sidevisninger" value={data.kpi.pageviews} prev={data.kpi.prev.pageviews} icon={Eye} />
            <KpiCard label="Unike besøkende" value={data.kpi.visitors} prev={data.kpi.prev.visitors} icon={Users} />
            <KpiCard label="Konverteringer" value={data.kpi.conversions} prev={data.kpi.prev.conversions} icon={Target} />
            <KpiCard
              label="Konverteringsrate"
              value={data.kpi.conversionRate}
              prev={data.kpi.prev.visitors ? data.kpi.prev.conversions / data.kpi.prev.visitors : 0}
              icon={MousePointerClick}
              formatter={formatPercent}
            />
          </>
        )}
      </div>

      {/* Time-series chart */}
      <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Trafikk og konvertering over tid</h3>
            <p className="text-xs text-muted-foreground">Sidevisninger og konverteringer pr. dag</p>
          </div>
        </div>
        <div className="h-64">
          {loading || !data ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeseries} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickFormatter={formatDate}
                  tickMargin={6}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} width={36} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => formatDate(v as string)}
                />
                <Area type="monotone" dataKey="pageviews" stroke="hsl(var(--primary))" fill="url(#pvGrad)" name="Sidevisninger" />
                <Area type="monotone" dataKey="conversions" stroke="hsl(var(--success))" fill="url(#convGrad)" name="Konverteringer" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Sources + Countries + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-card/80 backdrop-blur border-border/60 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-1">Trafikkilder</h3>
          <p className="text-xs text-muted-foreground mb-4">Hvor kommer besøkende fra?</p>
          {loading || !data ? (
            <Skeleton className="h-48" />
          ) : data.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Ingen data ennå.</p>
          ) : (
            <div className="space-y-3">
              {data.sources.map((s) => (
                <div key={`${s.source}-${s.medium}`} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.source}</div>
                    <div className="text-[11px] text-muted-foreground">{s.medium}</div>
                    <div className="mt-1.5">
                      <HorizontalBar value={s.visitors} max={maxSourceVisitors} />
                    </div>
                  </div>
                  <div className="text-sm tabular-nums font-medium text-right w-16">{formatNumber(s.visitors)}</div>
                  <Badge variant={s.conversions ? 'default' : 'secondary'} className="text-[10px] tabular-nums w-12 justify-center">
                    {s.conversions} kv
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
          <h3 className="text-sm font-semibold mb-1">Enheter</h3>
          <p className="text-xs text-muted-foreground mb-4">Mobil, tablet eller desktop</p>
          <div className="h-48">
            {loading || !data ? (
              <Skeleton className="h-full w-full" />
            ) : data.devices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Ingen data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.devices}
                    dataKey="count"
                    nameKey="device"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {data.devices.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {data && data.devices.length > 0 && (
            <div className="space-y-1 mt-3">
              {data.devices.map((d, i) => (
                <div key={d.device} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="capitalize">{d.device}</span>
                  <span className="ml-auto text-muted-foreground tabular-nums">{formatNumber(d.count)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Countries + Top pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
          <h3 className="text-sm font-semibold mb-4">Land</h3>
          {loading || !data ? (
            <Skeleton className="h-40" />
          ) : data.countries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Ingen data ennå.</p>
          ) : (
            <div className="space-y-2.5">
              {data.countries.map((c) => (
                <div key={c.country} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                  <div className="min-w-0">
                    <div className="text-sm">{COUNTRY_NAMES[c.country] || c.country}</div>
                    <div className="mt-1">
                      <HorizontalBar value={c.visits} max={maxCountry} />
                    </div>
                  </div>
                  <div className="text-sm tabular-nums text-muted-foreground w-12 text-right">
                    {formatNumber(c.visits)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
          <h3 className="text-sm font-semibold mb-4">Toppsider</h3>
          {loading || !data ? (
            <Skeleton className="h-40" />
          ) : data.topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Ingen data ennå.</p>
          ) : (
            <div className="space-y-2.5">
              {data.topPages.map((p) => (
                <div key={p.path} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                  <div className="min-w-0">
                    <div className="text-xs font-mono truncate">{p.path}</div>
                    <div className="mt-1">
                      <HorizontalBar value={p.visits} max={maxPage} />
                    </div>
                  </div>
                  <div className="text-sm tabular-nums w-12 text-right">{formatNumber(p.visits)}</div>
                  <Badge variant={p.conversions ? 'default' : 'secondary'} className="text-[10px] tabular-nums w-12 justify-center">
                    {p.conversions} kv
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Funnel + Conversion sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
          <h3 className="text-sm font-semibold mb-1">Konverteringstrakt</h3>
          <p className="text-xs text-muted-foreground mb-4">Fra besøk til henvendelse</p>
          {loading || !data ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-3">
              {data.funnel.map((f, i) => {
                const pct = (f.count / maxFunnel) * 100;
                return (
                  <div key={f.step}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-medium">{f.step}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatNumber(f.count)}{' '}
                        {i > 0 && data.funnel[i - 1].count > 0 && (
                          <span className="text-xs">({formatPercent(f.count / data.funnel[i - 1].count)})</span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-muted/60 rounded">
                      <div
                        className={cn('h-full rounded', i === 2 ? 'bg-success' : 'bg-primary')}
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
          <h3 className="text-sm font-semibold mb-1">Hva genererer henvendelser</h3>
          <p className="text-xs text-muted-foreground mb-4">Fordeling av konverteringer</p>
          <div className="h-44">
            {loading || !data ? (
              <Skeleton className="h-full w-full" />
            ) : data.conversionSources.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Ingen konverteringer ennå.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.conversionSources.map((c) => ({ name: EVENT_LABELS[c.name] || c.name, count: c.count }))}
                  layout="vertical"
                  margin={{ left: 0, right: 12, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={130} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Recent conversions */}
      <Card className="p-5 bg-card/80 backdrop-blur border-border/60">
        <h3 className="text-sm font-semibold mb-1">Siste henvendelser</h3>
        <p className="text-xs text-muted-foreground mb-4">De 20 nyeste konverteringene</p>
        {loading || !data ? (
          <Skeleton className="h-40" />
        ) : data.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Ingen henvendelser i perioden.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/60">
                  <th className="py-2 pr-3 font-medium">Når</th>
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Kunde</th>
                  <th className="py-2 pr-3 font-medium">Kilde</th>
                  <th className="py-2 pr-3 font-medium">Side</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="py-2 pr-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatRelative(r.occurred_at)}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant="default" className="text-[10px]">
                        {EVENT_LABELS[r.event_name] || r.event_name}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3">
                      {r.name ? (
                        <div>
                          <div className="font-medium">{r.name}</div>
                          {r.email && <div className="text-xs text-muted-foreground">{r.email}</div>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="text-xs">{r.source}</div>
                      <div className="text-[10px] text-muted-foreground">{r.medium}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {r.path || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
