import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalQuotes: number;
  activeJobs: number;
  completedJobs: number;
  unreadNotifications: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) {
        return {
          totalQuotes: 0,
          activeJobs: 0,
          completedJobs: 0,
          unreadNotifications: 0,
        };
      }

      const [quotesResult, jobsResult, notificationsResult] = await Promise.all([
        supabase.from("quotes").select("*", { count: "exact" }).eq("user_id", user.id),
        supabase.from("jobs").select("*").eq("user_id", user.id),
        supabase.from("notifications").select("*", { count: "exact" }).eq("user_id", user.id).eq("read", false),
      ]);

      const activeJobs = jobsResult.data?.filter((job) =>
        ["confirmed", "started", "in_progress"].includes(job.status)
      ).length || 0;

      const completedJobs = jobsResult.data?.filter((job) =>
        job.status === "completed"
      ).length || 0;

      return {
        totalQuotes: quotesResult.count || 0,
        activeJobs,
        completedJobs,
        unreadNotifications: notificationsResult.count || 0,
      };
    },
    enabled: !!user,
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  return {
    stats: data ?? {
      totalQuotes: 0,
      activeJobs: 0,
      completedJobs: 0,
      unreadNotifications: 0,
    },
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
