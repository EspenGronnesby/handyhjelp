import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AnalyticsSummary = {
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

async function fetchSummary(days: number): Promise<AnalyticsSummary> {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  const { data, error } = await supabase.functions.invoke('analytics-summary', {
    body: { from: from.toISOString(), to: to.toISOString() },
  });
  if (error) throw error;
  return data as AnalyticsSummary;
}

export function useAnalyticsOverview(enabled: boolean) {
  return useQuery({
    queryKey: ['analytics', 'overview', '7d'],
    queryFn: () => fetchSummary(7),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
