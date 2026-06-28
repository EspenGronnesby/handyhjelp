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
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  MousePointerClick,
  RefreshCw,
  Target,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';

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

const PAGE_LABELS: Record<string, string> = {
  '/': 'Hjemmeside',
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
  '/dashboard/owner': 'Eier-panel',
  '/dashboard/analytics': 'Analyse',
};

function friendlyPath(p: string): string {
  // Strip query params to get base path
  const base = p.split('?')[0];
  return PAGE_LABELS[base] ?? base;
}

function isInternalPath(p: string): boolean {
  return p.includes('__lovable') || p.includes('lovable_sha') || p.includes('lovable_load');
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('nb-NO').format(Math.round(n));
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

function initials(name: string | null): string {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/);
  const res = (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
  return res.toUpperCase() || '·';
}

function delta(curr: number, prev: number): { value: number; positive: boolean; show: boolean } {
  if (!prev && !curr) return { value: 0, positive: true, show: false };
  if (!prev) return { value: 1, positive: true, show: true };
  const v = (curr - prev) / prev;
  return { value: Math.abs(v), positive: v >= 0, show: true };
}

// Shared chart tooltip styling (dark/premium surface)
const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 8px 30px -8px hsl(222 47% 4% / 0.6)',
} as const;

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
    <div className="h-full rounded-2xl bg-gradient-to-br from-primary/40 via-border/30 to-accent/20 p-px shadow-[0_8px_30px_-12px_hsl(222_47%_4%/0.8)]">
      <Card className="h-full rounded-2xl border-0 bg-card/80 backdrop-blur-xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30 shadow-[0_0_22px_-6px_hsl(var(--primary)/0.9)]">
            <Icon className="h-4 w-4" />
          </div>
          {d.show && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
                d.positive ? 'text-success bg-success/15' : 'text-destructive bg-destructive/15'
              )}
            >
              {d.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {formatPercent(d.value)}
            </span>
          )}
        </div>
        <AnimatedNumber
          value={value}
          formatter={formatter}
          className="block text-2xl sm:text-3xl font-bold tracking-tight tabular-nums"
        />
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </Card>
    </div>
  );
}

function HorizontalBar({ value, max, success = false }: { value: number; max: number; success?: boolean }) {
  const pct = max ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full',
          success
            ? 'bg-gradient-to-r from-success to-success/60'
            : 'bg-gradient-to-r from-primary to-primary/50'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// Reusable card shell for the dark surface
function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Card className={cn('rounded-2xl border-border/50 bg-card/60 backdrop-blur-xl p-5', className)}>
      {children}
    </Card>
  );
}

export const AnalyticsPanel = () => {
  const [range, setRange] = useState('30');
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06, delayChildren: reduce ? 0 : 0.04 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
  const hover = reduce ? undefined : { y: -3 };

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
      setLastFetched(new Date());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Kunne ikke laste analyse');
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
  const visiblePages = useMemo(
    () => (data?.topPages ?? []).filter((p) => !isInternalPath(p.path)).slice(0, 6),
    [data]
  );

  return (
    <div className="blue relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-[hsl(222_47%_9%)] via-[hsl(222_44%_11%)] to-[hsl(222_42%_13%)] text-foreground shadow-2xl">
      {/* Soft glow accents */}
      <div className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-success/10 blur-3xl" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative p-5 sm:p-7 space-y-6"
      >
        {/* Header / controls */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 ring-1 ring-primary/30 shadow-[0_0_28px_-6px_hsl(var(--primary)/0.9)]">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                Analyse
                <span className="relative flex h-2 w-2" aria-hidden>
                  {!reduce && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/70" />
                  )}
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">Live data fra besøkende og henvendelser</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastFetched && (
              <span className="text-xs text-muted-foreground hidden md:inline">
                Sist oppdatert {lastFetched.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Tabs value={range} onValueChange={setRange}>
              <TabsList className="bg-white/5">
                {RANGE_OPTIONS.map((o) => (
                  <TabsTrigger key={o.value} value={o.value} className="text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                    {o.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button size="sm" variant="outline" onClick={fetchData} disabled={loading} className="border-white/15 bg-white/5 hover:bg-white/10">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </motion.div>

        {err && (
          <motion.div variants={item}>
            <Card className="p-4 rounded-2xl border-destructive/40 bg-destructive/10 text-sm text-destructive">
              {err}
            </Card>
          </motion.div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading || !data ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-white/5" />)
          ) : (
            <>
              <motion.div variants={item} whileHover={hover}>
                <KpiCard label="Sidevisninger" value={data.kpi.pageviews} prev={data.kpi.prev.pageviews} icon={Eye} />
              </motion.div>
              <motion.div variants={item} whileHover={hover}>
                <KpiCard label="Unike besøkende" value={data.kpi.visitors} prev={data.kpi.prev.visitors} icon={Users} />
              </motion.div>
              <motion.div variants={item} whileHover={hover}>
                <KpiCard label="Konverteringer" value={data.kpi.conversions} prev={data.kpi.prev.conversions} icon={Target} />
              </motion.div>
              <motion.div variants={item} whileHover={hover}>
                <KpiCard
                  label="Konverteringsrate"
                  value={data.kpi.conversionRate}
                  prev={data.kpi.prev.visitors ? data.kpi.prev.conversions / data.kpi.prev.visitors : 0}
                  icon={MousePointerClick}
                  formatter={formatPercent}
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Time-series chart (large) */}
        <motion.div variants={item}>
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Trafikk og konvertering over tid</h3>
                <p className="text-xs text-muted-foreground">Sidevisninger og konverteringer pr. dag</p>
              </div>
            </div>
            <div className="h-72 sm:h-80">
              {loading || !data ? (
                <Skeleton className="h-full w-full bg-white/5" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.timeseries} margin={{ left: -10, right: 8, top: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
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
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => formatDate(v as string)} />
                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      fill="url(#pvGrad)"
                      name="Sidevisninger"
                      animationDuration={reduce ? 0 : 1100}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversions"
                      stroke="hsl(var(--success))"
                      strokeWidth={2.5}
                      fill="url(#convGrad)"
                      name="Konverteringer"
                      animationDuration={reduce ? 0 : 1100}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </motion.div>

        {/* Sources + What converts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div variants={item} className="lg:col-span-2">
            <Panel className="h-full">
              <h3 className="text-sm font-semibold mb-1">Trafikkilder</h3>
              <p className="text-xs text-muted-foreground mb-4">Hvor kommer besøkende fra?</p>
              {loading || !data ? (
                <Skeleton className="h-48 bg-white/5" />
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
            </Panel>
          </motion.div>

          <motion.div variants={item}>
            <Panel className="h-full">
              <h3 className="text-sm font-semibold mb-1">Hva genererer henvendelser</h3>
              <p className="text-xs text-muted-foreground mb-4">Fordeling av konverteringer</p>
              <div className="h-52">
                {loading || !data ? (
                  <Skeleton className="h-full w-full bg-white/5" />
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
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--primary) / 0.08)' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} animationDuration={reduce ? 0 : 900} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Panel>
          </motion.div>
        </div>

        {/* Conversion funnel */}
        <motion.div variants={item}>
          <Panel>
            <h3 className="text-sm font-semibold mb-1">Konverteringstrakt</h3>
            <p className="text-xs text-muted-foreground mb-4">Fra besøk til henvendelse</p>
            {loading || !data ? (
              <Skeleton className="h-32 bg-white/5" />
            ) : (
              <div className="space-y-4">
                {data.funnel.map((f, i) => {
                  const pct = (f.count / maxFunnel) * 100;
                  const isConv = i === data.funnel.length - 1;
                  return (
                    <div key={f.step}>
                      <div className="flex items-center justify-between mb-1.5 text-sm">
                        <span className="font-medium">{f.step}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatNumber(f.count)}{' '}
                          {i > 0 && data.funnel[i - 1].count > 0 && (
                            <span className="text-xs">({formatPercent(f.count / data.funnel[i - 1].count)})</span>
                          )}
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            'h-full rounded-full',
                            isConv ? 'bg-gradient-to-r from-success to-success/60' : 'bg-gradient-to-r from-primary to-primary/50'
                          )}
                          initial={reduce ? false : { width: 0 }}
                          animate={{ width: `${Math.max(2, pct)}%` }}
                          transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : i * 0.12 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </motion.div>

        {/* Recent conversions feed (highlighted, with names) */}
        <motion.div variants={item}>
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Siste henvendelser</h3>
                <p className="text-xs text-muted-foreground">De nyeste konverteringene — med navn</p>
              </div>
              <Badge variant="secondary" className="bg-white/5">{data?.recent.length ?? 0}</Badge>
            </div>
            {loading || !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />)}
              </div>
            ) : data.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Ingen henvendelser i perioden.</p>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {data.recent.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : Math.min(i * 0.04, 0.4) }}
                    className="flex items-center gap-3 rounded-xl border border-border/40 bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/30 text-sm font-semibold ring-1 ring-white/10">
                      {initials(r.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold truncate">{r.name || 'Anonym besøkende'}</span>
                        <Badge variant="default" className="text-[10px] bg-primary/20 text-primary hover:bg-primary/25 border-0">
                          {EVENT_LABELS[r.event_name] || r.event_name}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.email || `${r.source} · ${r.medium}`}
                        {r.path && <span className="text-muted-foreground/60"> · {friendlyPath(r.path)}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-muted-foreground whitespace-nowrap">{formatRelative(r.occurred_at)}</div>
                      <div className="text-[10px] text-muted-foreground/70 whitespace-nowrap">{r.source}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Panel>
        </motion.div>

        {/* Compact bottom row: Devices + Countries + Top pages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Devices */}
          <motion.div variants={item}>
            <Panel className="h-full">
              <h3 className="text-sm font-semibold mb-1">Enheter</h3>
              <p className="text-xs text-muted-foreground mb-3">Mobil, tablet eller desktop</p>
              <div className="h-40">
                {loading || !data ? (
                  <Skeleton className="h-full w-full bg-white/5" />
                ) : data.devices.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">Ingen data</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.devices}
                        dataKey="count"
                        nameKey="device"
                        innerRadius={40}
                        outerRadius={62}
                        paddingAngle={2}
                        animationDuration={reduce ? 0 : 900}
                      >
                        {data.devices.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {data && data.devices.length > 0 && (
                <div className="space-y-1 mt-2">
                  {data.devices.map((d, i) => (
                    <div key={d.device} className="flex items-center gap-2 text-xs">
                      <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="capitalize">{d.device}</span>
                      <span className="ml-auto text-muted-foreground tabular-nums">{formatNumber(d.count)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </motion.div>

          {/* Countries */}
          <motion.div variants={item}>
            <Panel className="h-full">
              <h3 className="text-sm font-semibold mb-3">Land</h3>
              {loading || !data ? (
                <Skeleton className="h-40 bg-white/5" />
              ) : data.countries.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Ingen data ennå.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.countries.slice(0, 6).map((c) => (
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
            </Panel>
          </motion.div>

          {/* Top pages */}
          <motion.div variants={item}>
            <Panel className="h-full">
              <h3 className="text-sm font-semibold mb-3">Toppsider</h3>
              {loading || !data ? (
                <Skeleton className="h-40 bg-white/5" />
              ) : visiblePages.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Ingen data ennå.</p>
              ) : (
                <div className="space-y-2.5">
                  {visiblePages.map((p) => (
                    <div key={p.path} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{friendlyPath(p.path)}</div>
                        <div className="mt-1">
                          <HorizontalBar value={p.visits} max={maxPage} />
                        </div>
                      </div>
                      <div className="text-sm tabular-nums w-10 text-right">{formatNumber(p.visits)}</div>
                      <Badge variant={p.conversions ? 'default' : 'secondary'} className="text-[10px] tabular-nums w-10 justify-center">
                        {p.conversions}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPanel;
