import { LoginResponse, ProjectsResponse } from "@/types/customer";

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  "Content-Type": "application/json",
  "apikey": API_KEY,
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const loginCustomer = async (email: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE}/customer-login`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Nettverksfeil ved innlogging",
    };
  }
};

export const getCustomerProjects = async (email: string): Promise<ProjectsResponse> => {
  try {
    const response = await fetch(`${API_BASE}/customer-get-projects`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get projects error:", error);
    return {
      projects: [],
      error: error instanceof Error ? error.message : "Nettverksfeil ved henting av prosjekter",
    };
  }
};
