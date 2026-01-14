export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agreement_activities: {
        Row: {
          action: string
          agreement_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
        }
        Insert: {
          action: string
          agreement_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
        }
        Update: {
          action?: string
          agreement_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_activities_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "service_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_download_tokens: {
        Row: {
          agreement_id: string
          created_at: string
          document_type: string
          expires_at: string
          id: string
          ip_address: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          agreement_id: string
          created_at?: string
          document_type: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          agreement_id?: string
          created_at?: string
          document_type?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_download_tokens_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "service_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          category: string
          content: string
          cover_image_url: string
          created_at: string
          id: string
          published_at: string | null
          reading_time: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          submitted_at: string | null
          submitted_by: string | null
          summary: string
          tenant_id: string | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category: string
          content: string
          cover_image_url: string
          created_at?: string
          id?: string
          published_at?: string | null
          reading_time?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          summary: string
          tenant_id?: string | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category?: string
          content?: string
          cover_image_url?: string
          created_at?: string
          id?: string
          published_at?: string | null
          reading_time?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          summary?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          opacity: number | null
          page: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          opacity?: number | null
          page: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          opacity?: number | null
          page?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_images_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_requests: {
        Row: {
          created_at: string
          id: string
          job_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_requests_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          file_url: string | null
          id: string
          invoice_number: string
          job_id: string
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          file_url?: string | null
          id?: string
          invoice_number: string
          job_id: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          file_url?: string | null
          id?: string
          invoice_number?: string
          job_id?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          job_id: string
          photo_type: string
          photo_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id: string
          photo_type: string
          photo_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id?: string
          photo_type?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          amount: number | null
          completed_date: string | null
          created_at: string
          estimated_completion: string | null
          feedback_sent_at: string | null
          id: string
          notes: string | null
          quote_id: string
          scheduled_date: string | null
          started_at: string | null
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          completed_date?: string | null
          created_at?: string
          estimated_completion?: string | null
          feedback_sent_at?: string | null
          id?: string
          notes?: string | null
          quote_id: string
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          completed_date?: string | null
          created_at?: string
          estimated_completion?: string | null
          feedback_sent_at?: string | null
          id?: string
          notes?: string | null
          quote_id?: string
          scheduled_date?: string | null
          started_at?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_campaigns: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          multiplier: number | null
          name: string
          start_date: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          multiplier?: number | null
          name: string
          start_date: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          multiplier?: number | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          lifetime_points: number | null
          tier: Database["public"]["Enums"]["loyalty_tier"] | null
          tier_updated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          tier_updated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          lifetime_points?: number | null
          tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          tier_updated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      loyalty_tiers: {
        Row: {
          benefits: Json | null
          created_at: string | null
          discount_percentage: number | null
          points_required: number
          tier: Database["public"]["Enums"]["loyalty_tier"]
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          discount_percentage?: number | null
          points_required: number
          tier: Database["public"]["Enums"]["loyalty_tier"]
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          discount_percentage?: number | null
          points_required?: number
          tier?: Database["public"]["Enums"]["loyalty_tier"]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          tenant_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          tenant_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          tenant_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          customer_type: string | null
          edit_mode_enabled: boolean | null
          email: string
          full_name: string
          id: string
          org_number: string | null
          phone: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: string | null
          edit_mode_enabled?: boolean | null
          email: string
          full_name: string
          id: string
          org_number?: string | null
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          customer_type?: string | null
          edit_mode_enabled?: boolean | null
          email?: string
          full_name?: string
          id?: string
          org_number?: string | null
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          after_image_url: string
          before_image_url: string
          category: string
          completed_date: string
          created_at: string
          description: string
          display_order: number | null
          id: string
          location: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url: string
          before_image_url: string
          category: string
          completed_date: string
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          location: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string
          before_image_url?: string
          category?: string
          completed_date?: string
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          location?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      quick_feedback: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          job_id: string
          rating: string | null
          token: string
          token_used_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          job_id: string
          rating?: string | null
          token: string
          token_used_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          job_id?: string
          rating?: string | null
          token?: string
          token_used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_feedback_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          description: string
          email: string
          id: string
          name: string
          org_number: string | null
          phone: string
          status: string
          tenant_id: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          org_number?: string | null
          phone: string
          status?: string
          tenant_id?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          org_number?: string | null
          phone?: string
          status?: string
          tenant_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          referrer_user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          referrer_user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          referrer_user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment: string | null
          created_at: string
          id: string
          job_id: string
          rating: number
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          job_id: string
          rating: number
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          job_id?: string
          rating?: number
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_agreements: {
        Row: {
          additional_info: string | null
          address: string
          admin_notes: string | null
          contact_person: string
          contact_role: string
          contract_document_url: string | null
          contract_duration: string
          contract_signed_at: string | null
          created_at: string
          current_situation: string
          customer_approved_at: string | null
          customer_type: string
          email: string
          fixed_contact_person: boolean
          frequency: string
          id: string
          offer_amount: number | null
          offer_document_url: string | null
          offer_sent_at: string | null
          other_services: string | null
          phone: string
          rejected_at: string | null
          rejection_reason: string | null
          services: Json
          start_date: string | null
          status: string
          tenant_id: string | null
          total_area: number | null
          units_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_info?: string | null
          address: string
          admin_notes?: string | null
          contact_person: string
          contact_role: string
          contract_document_url?: string | null
          contract_duration: string
          contract_signed_at?: string | null
          created_at?: string
          current_situation: string
          customer_approved_at?: string | null
          customer_type: string
          email: string
          fixed_contact_person?: boolean
          frequency: string
          id?: string
          offer_amount?: number | null
          offer_document_url?: string | null
          offer_sent_at?: string | null
          other_services?: string | null
          phone: string
          rejected_at?: string | null
          rejection_reason?: string | null
          services?: Json
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          total_area?: number | null
          units_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_info?: string | null
          address?: string
          admin_notes?: string | null
          contact_person?: string
          contact_role?: string
          contract_document_url?: string | null
          contract_duration?: string
          contract_signed_at?: string | null
          created_at?: string
          current_situation?: string
          customer_approved_at?: string | null
          customer_type?: string
          email?: string
          fixed_contact_person?: boolean
          frequency?: string
          id?: string
          offer_amount?: number | null
          offer_document_url?: string | null
          offer_sent_at?: string | null
          other_services?: string | null
          phone?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          services?: Json
          start_date?: string | null
          status?: string
          tenant_id?: string | null
          total_area?: number | null
          units_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_agreements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_colors: {
        Row: {
          color_key: string
          color_value: string
          id: string
          updated_at: string | null
        }
        Insert: {
          color_key: string
          color_value: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          color_key?: string
          color_value?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string | null
          content_value: string
          id: string
          section: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_type?: string | null
          content_value: string
          id?: string
          section: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string | null
          content_value?: string
          id?: string
          section?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      site_images: {
        Row: {
          alt_text: string | null
          id: string
          image_key: string
          image_url: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          alt_text?: string | null
          id?: string
          image_key: string
          image_url: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          alt_text?: string | null
          id?: string
          image_key?: string
          image_url?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      support_access: {
        Row: {
          access_level: string | null
          created_at: string | null
          expires_at: string
          granted_by: string
          id: string
          reason: string | null
          revoked_at: string | null
          support_user_id: string
          tenant_id: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          expires_at: string
          granted_by: string
          id?: string
          reason?: string | null
          revoked_at?: string | null
          support_user_id: string
          tenant_id: string
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          expires_at?: string
          granted_by?: string
          id?: string
          reason?: string | null
          revoked_at?: string | null
          support_user_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_access_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          image_url: string
          name: string
          position: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url: string
          name: string
          position: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string
          name?: string
          position?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string | null
          created_by: string | null
          domain: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_reference_type?: string
          p_type: Database["public"]["Enums"]["transaction_type"]
          p_user_id: string
        }
        Returns: string
      }
      can_access_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      expire_old_points: { Args: never; Returns: number }
      generate_download_token: {
        Args: { p_agreement_id: string; p_document_type: string }
        Returns: string
      }
      get_active_campaign_multiplier: { Args: never; Returns: number }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_support_access: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      log_audit: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_record_id?: string
          p_table_name: string
          p_tenant_id: string
        }
        Returns: string
      }
      validate_download_token: {
        Args: { p_ip_address?: string; p_token: string }
        Returns: {
          agreement_id: string
          contact_person: string
          contract_document_url: string
          document_type: string
          is_valid: boolean
          offer_document_url: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "platform_owner"
        | "tenant_admin"
        | "worker"
      loyalty_tier: "bronze" | "silver" | "gold"
      transaction_type:
        | "earned"
        | "spent"
        | "expired"
        | "bonus"
        | "referral"
        | "welcome"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "platform_owner",
        "tenant_admin",
        "worker",
      ],
      loyalty_tier: ["bronze", "silver", "gold"],
      transaction_type: [
        "earned",
        "spent",
        "expired",
        "bonus",
        "referral",
        "welcome",
      ],
    },
  },
} as const
