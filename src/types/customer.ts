export interface CustomerSession {
  email: string;
  name: string;
  projectCount: number;
  loginTime: string;
}

export interface Project {
  id: string;
  name: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  description?: string;
  total_duration_seconds: number;
  time_entry_count: number;
  total_kilometers: number;
  drive_entry_count: number;
  material_count: number;
}

export interface LoginResponse {
  success: boolean;
  customer?: {
    email: string;
    name: string;
  };
  projectCount?: number;
  error?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  error?: string;
}
