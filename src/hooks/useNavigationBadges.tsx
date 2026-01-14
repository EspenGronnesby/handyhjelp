import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

interface NavigationBadges {
  notifications: number;
  overview: number;
  admin: number;
  worker: number;
}

export function useNavigationBadges() {
  const { user } = useAuth();
  const { isAdmin, isOwner, isWorker } = useRole();

  const { data: badges, isLoading } = useQuery({
    queryKey: ["navigation-badges", user?.id, isAdmin, isOwner, isWorker],
    queryFn: async (): Promise<NavigationBadges> => {
      if (!user) {
        return { notifications: 0, overview: 0, admin: 0, worker: 0 };
      }

      // Fetch all counts in parallel
      const [
        notificationsResult,
        activeJobsResult,
        pendingQuotesResult,
      ] = await Promise.all([
        // Unread notifications for user
        supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("read", false),
        
        // Active jobs for user (overview)
        supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .in("status", ["confirmed", "started", "in_progress"]),
        
        // Pending quotes for user (overview)
        supabase
          .from("quotes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "pending"),
      ]);

      const notificationsCount = notificationsResult.count || 0;
      const activeJobsCount = activeJobsResult.count || 0;
      const pendingQuotesCount = pendingQuotesResult.count || 0;
      const overviewCount = activeJobsCount + pendingQuotesCount;

      // Admin-specific queries
      let adminCount = 0;
      if (isAdmin || isOwner) {
        const [
          adminPendingQuotesResult,
          adminNewAgreementsResult,
          adminPendingReviewsResult,
          adminPendingProjectsResult,
          adminPendingBlogsResult,
        ] = await Promise.all([
          supabase
            .from("quotes")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          
          supabase
            .from("service_agreements")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
          
          supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending_approval"),
          
          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending_approval"),
        ]);

        adminCount = 
          (adminPendingQuotesResult.count || 0) +
          (adminNewAgreementsResult.count || 0) +
          (adminPendingReviewsResult.count || 0) +
          (adminPendingProjectsResult.count || 0) +
          (adminPendingBlogsResult.count || 0);
      }

      // Worker-specific queries
      let workerCount = 0;
      if (isWorker) {
        const [
          workerProjectsResult,
          workerBlogsResult,
        ] = await Promise.all([
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", user.id)
            .in("status", ["pending_approval", "rejected"]),
          
          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", user.id)
            .in("status", ["pending_approval", "rejected"]),
        ]);

        workerCount = 
          (workerProjectsResult.count || 0) +
          (workerBlogsResult.count || 0);
      }

      return {
        notifications: notificationsCount,
        overview: overviewCount,
        admin: adminCount,
        worker: workerCount,
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  return {
    badges: badges ?? { notifications: 0, overview: 0, admin: 0, worker: 0 },
    isLoading,
  };
}
