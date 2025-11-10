import { useState, useEffect } from "react";
import { Project } from "@/types/customer";
import { getCustomerProjects } from "@/lib/customerApi";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}t ${minutes}m`;
};

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "dd.MM.yyyy", { locale: nb });
  } catch (error) {
    console.error("Date format error:", error);
    return dateString;
  }
};

export const useCustomerProjects = (email?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (email) {
      fetchProjects(email);
    }
  }, [email]);

  const fetchProjects = async (customerEmail: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCustomerProjects(customerEmail);

      if (response.error) {
        setError(response.error);
      } else {
        setProjects(response.projects || []);
      }
    } catch (error) {
      setError("Kunne ikke hente prosjekter");
      console.error("Fetch projects error:", error);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    if (email) {
      fetchProjects(email);
    }
  };

  return {
    projects,
    loading,
    error,
    refetch,
  };
};
