/**
 * Postgres `public` schema types for `createClient<Database>()`.
 * Align with your Supabase tables (SQL Editor / migrations).
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Matches `public.user_tier`. */
export type UserTier = "free" | "starter" | "pro" | "enterprise";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          payment_customer_id: string | null;
          ziina_customer_id: string | null;
          ziina_last_payment_intent_id: string | null;
          tier: UserTier;
          monthly_lead_quota_override: number | null;
          tier_expires_at: string | null;
          billing_currency: string | null;
          referred_by_affiliate_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          payment_customer_id?: string | null;
          ziina_customer_id?: string | null;
          ziina_last_payment_intent_id?: string | null;
          tier?: UserTier;
          monthly_lead_quota_override?: number | null;
          tier_expires_at?: string | null;
          billing_currency?: string | null;
          referred_by_affiliate_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          payment_customer_id?: string | null;
          ziina_customer_id?: string | null;
          ziina_last_payment_intent_id?: string | null;
          tier?: UserTier;
          monthly_lead_quota_override?: number | null;
          tier_expires_at?: string | null;
          billing_currency?: string | null;
          referred_by_affiliate_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          referral_code: string;
          total_earnings_minor: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          referral_code: string;
          total_earnings_minor?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          referral_code?: string;
          total_earnings_minor?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      affiliate_commissions: {
        Row: {
          id: string;
          affiliate_id: string;
          referred_user_id: string;
          payment_intent_id: string;
          amount_paid_minor: number;
          commission_minor: number;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          referred_user_id: string;
          payment_intent_id: string;
          amount_paid_minor: number;
          commission_minor: number;
          currency: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          affiliate_id?: string;
          referred_user_id?: string;
          payment_intent_id?: string;
          amount_paid_minor?: number;
          commission_minor?: number;
          currency?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          user_id: string;
          search_parms: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          search_parms?: Json;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          search_parms?: Json;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          campaign_id: string;
          name: string;
          linkedin_url: string | null;
          email: string | null;
          personalised_pitch: string | null;
          status: string;
          first_name: string | null;
          company: string | null;
          target_problem: string | null;
          ai_email_draft: string | null;
          raw_row: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          name: string;
          linkedin_url?: string | null;
          email?: string | null;
          personalised_pitch?: string | null;
          status?: string;
          first_name?: string | null;
          company?: string | null;
          target_problem?: string | null;
          ai_email_draft?: string | null;
          raw_row?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          name?: string;
          linkedin_url?: string | null;
          email?: string | null;
          personalised_pitch?: string | null;
          status?: string;
          first_name?: string | null;
          company?: string | null;
          target_problem?: string | null;
          ai_email_draft?: string | null;
          raw_row?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      ziina_checkout_operations: {
        Row: {
          operation_id: string;
          user_id: string;
          tier: UserTier;
          billing_interval: string;
          currency: string;
          payment_intent_id: string | null;
          created_at: string;
        };
        Insert: {
          operation_id: string;
          user_id: string;
          tier: UserTier;
          billing_interval: string;
          currency?: string;
          payment_intent_id?: string | null;
          created_at?: string;
        };
        Update: {
          operation_id?: string;
          user_id?: string;
          tier?: UserTier;
          billing_interval?: string;
          currency?: string;
          payment_intent_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      processed_webhook_events: {
        Row: {
          id: string;
          provider: string;
          created_at: string;
        };
        Insert: {
          id: string;
          provider?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_tier: UserTier;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type TypedSupabaseClient = SupabaseClient<Database, "public", any>;

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
