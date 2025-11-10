import { LoginResponse, ProjectsResponse } from "@/types/customer";

const API_BASE = "https://odbqdzmdlelotqfuxbwf.supabase.co/functions/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnFkem1kbGVsb3RxZnV4YndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTY1NTQsImV4cCI6MjA3NTE3MjU1NH0.g4P9Zc_-IvlaXY9RgzjMykB0wNAV7bVim0jD4dabPyY";

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
