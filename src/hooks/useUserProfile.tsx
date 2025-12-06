import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  customer_type: "private" | "business" | null;
  company_name: string | null;
  org_number: string | null;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuth();

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, address, customer_type, company_name, org_number")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    profile: profile ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
