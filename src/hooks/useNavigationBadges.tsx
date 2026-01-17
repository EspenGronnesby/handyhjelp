import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

interface AdminDetails {
  pendingQuotes: number;
  activeJobs: number;
  newAgreements: number;
  pendingReviews: number;
  pendingProjects: number;
  pendingBlogs: number;
  pendingFeedback: number;
}

interface WorkerDetails {
  pendingProjects: number;
  pendingBlogs: number;
  rejectedProjects: number;
  rejectedBlogs: number;
}

interface NavigationBadges {
  notifications: number;
  overview: number;
  admin: number;
  worker: number;
  adminDetails: AdminDetails;
  workerDetails: WorkerDetails;
}

const defaultBadges: NavigationBadges = {
  notifications: 0,
  overview: 0,
  admin: 0,
  worker: 0,
  adminDetails: {
    pendingQuotes: 0,
    activeJobs: 0,
    newAgreements: 0,
    pendingReviews: 0,
    pendingProjects: 0,
    pendingBlogs: 0,
    pendingFeedback: 0,
  },
  workerDetails: {
    pendingProjects: 0,
    pendingBlogs: 0,
    rejectedProjects: 0,
    rejectedBlogs: 0,
  },
};

export function useNavigationBadges() {
  const { user } = useAuth();
  const { isAdmin, isOwner, isWorker } = useRole();
  const queryClient = useQueryClient();

  const { data: badges, isLoading } = useQuery({
    queryKey: ["navigation-badges", user?.id, isAdmin, isOwner, isWorker],
    queryFn: async (): Promise<NavigationBadges> => {
      if (!user) {
        return defaultBadges;
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

      // Admin-specific queries with detailed counts
      let adminCount = 0;
      let adminDetails: AdminDetails = {
        pendingQuotes: 0,
        activeJobs: 0,
        newAgreements: 0,
        pendingReviews: 0,
        pendingProjects: 0,
        pendingBlogs: 0,
        pendingFeedback: 0,
      };

      if (isAdmin || isOwner) {
        const [
          adminPendingQuotesResult,
          adminActiveJobsResult,
          adminNewAgreementsResult,
          adminPendingReviewsResult,
          adminPendingProjectsResult,
          adminPendingBlogsResult,
          adminPendingFeedbackResult,
        ] = await Promise.all([
          supabase
            .from("quotes")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          
          supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .in("status", ["confirmed", "started", "in_progress"]),
          
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

          supabase
            .from("general_feedback")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

        adminDetails = {
          pendingQuotes: adminPendingQuotesResult.count || 0,
          activeJobs: adminActiveJobsResult.count || 0,
          newAgreements: adminNewAgreementsResult.count || 0,
          pendingReviews: adminPendingReviewsResult.count || 0,
          pendingProjects: adminPendingProjectsResult.count || 0,
          pendingBlogs: adminPendingBlogsResult.count || 0,
          pendingFeedback: adminPendingFeedbackResult.count || 0,
        };

        adminCount = 
          adminDetails.pendingQuotes +
          adminDetails.newAgreements +
          adminDetails.pendingReviews +
          adminDetails.pendingProjects +
          adminDetails.pendingBlogs +
          adminDetails.pendingFeedback;
      }

      // Worker-specific queries with detailed counts
      let workerCount = 0;
      let workerDetails: WorkerDetails = {
        pendingProjects: 0,
        pendingBlogs: 0,
        rejectedProjects: 0,
        rejectedBlogs: 0,
      };

      if (isWorker) {
        const [
          workerPendingProjectsResult,
          workerRejectedProjectsResult,
          workerPendingBlogsResult,
          workerRejectedBlogsResult,
        ] = await Promise.all([
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", user.id)
            .eq("status", "pending_approval"),
          
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", user.id)
            .eq("status", "rejected"),
          
          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", user.id)
            .eq("status", "pending_approval"),
          
          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true })
            .eq("submitted_by", user.id)
            .eq("status", "rejected"),
        ]);

        workerDetails = {
          pendingProjects: workerPendingProjectsResult.count || 0,
          rejectedProjects: workerRejectedProjectsResult.count || 0,
          pendingBlogs: workerPendingBlogsResult.count || 0,
          rejectedBlogs: workerRejectedBlogsResult.count || 0,
        };

        workerCount = 
          workerDetails.pendingProjects +
          workerDetails.rejectedProjects +
          workerDetails.pendingBlogs +
          workerDetails.rejectedBlogs;
      }

      return {
        notifications: notificationsCount,
        overview: overviewCount,
        admin: adminCount,
        worker: workerCount,
        adminDetails,
        workerDetails,
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000, // Cache for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Realtime subscriptions for badge updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('badge-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quotes' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_agreements' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blog_posts' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'general_feedback' },
        () => queryClient.invalidateQueries({ queryKey: ["navigation-badges"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    badges: badges ?? defaultBadges,
    isLoading,
  };
}
