export interface Quote {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  status: string;
  created_at: string;
  address?: string;
  company_name?: string;
  org_number?: string;
  customer_type?: string;
  user_id?: string;
}

export interface Job {
  id: string;
  status: string;
  scheduled_date: string | null;
  completed_date: string | null;
  started_at: string | null;
  created_at: string;
  amount: number;
  notes: string | null;
  quote_id: string;
  user_id: string;
  quotes: {
    name: string;
    email: string;
    phone: string;
    description: string;
    type: string;
    company_name?: string;
    org_number?: string;
  };
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  customer_type: string | null;
  company_name: string | null;
  org_number: string | null;
  created_at: string;
}

export interface ServiceAgreement {
  id: string;
  customer_type: string;
  units_count: number | null;
  total_area: number | null;
  address: string;
  services: string[];
  other_services: string | null;
  frequency: string;
  fixed_contact_person: boolean;
  contract_duration: string;
  start_date: string | null;
  current_situation: string;
  contact_person: string;
  contact_role: string;
  email: string;
  phone: string;
  additional_info: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
  // Nye kolonner for tilbud og kontrakt
  offer_amount?: number | null;
  offer_document_url?: string | null;
  contract_document_url?: string | null;
  admin_notes?: string | null;
  offer_sent_at?: string | null;
  contract_signed_at?: string | null;
  customer_approved_at?: string | null;
}

export interface AgreementActivity {
  id: string;
  agreement_id: string;
  action: string;
  description: string;
  created_by: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  job_id: string;
  user_id: string;
  amount: number;
  due_date: string;
  file_url: string | null;
  status: string;
  invoice_number: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceRequest {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  created_at: string;
}

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Venter',
  in_progress: 'Pågår',
  completed: 'Fullført',
};

export const SERVICE_LABELS: Record<string, string> = {
  maintenance: 'Generelt vedlikehold',
  cleaning: 'Utvendig renhold',
  winter: 'Snømåking og strøing',
  summer: 'Gressklipping og hagearbeid',
  inspection: 'Tilsyn og inspeksjoner',
  other: 'Annet'
};

export const AGREEMENT_STATUS_LABELS: Record<string, string> = {
  new: 'Ny',
  under_review: 'Under vurdering',
  offer_sent: 'Tilbud sendt',
  contract_signed: 'Avtale inngått',
  rejected: 'Avslått'
};

export const AGREEMENT_STATUS_COLORS: Record<string, string> = {
  new: 'bg-yellow-500',
  under_review: 'bg-blue-500',
  offer_sent: 'bg-purple-500',
  contract_signed: 'bg-green-500',
  rejected: 'bg-red-500'
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: 'Ubetalt',
  paid: 'Betalt',
  overdue: 'Forfalt'
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  paid: 'bg-green-500',
  overdue: 'bg-red-500'
};
