/**
 * Generated from Supabase project wgborqkfnxfarkdaotsd.
 * Refresh: npm run db:types (CLI) or Supabase MCP generate_typescript_types.
 */
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_runtime_config: {
        Row: {
          id: string
          image_provider_default: string
          insights_default: boolean
          response_mode_default: string
          updated_at: string
        }
        Insert: {
          id: string
          image_provider_default: string
          insights_default?: boolean
          response_mode_default: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_provider_default?: string
          insights_default?: boolean
          response_mode_default?: string
          updated_at?: string
        }
        Relationships: []
      }
      anonymous_purchase_log: {
        Row: {
          created_at: string
          event_hash: string
          event_type: string
          id: number
          product_id: string
          raw_event: Json | null
          rc_anonymous_id: string
          resolved: boolean
          resolved_at: string | null
          resolved_for: string | null
          tokens: number
        }
        Insert: {
          created_at?: string
          event_hash: string
          event_type: string
          id?: number
          product_id: string
          raw_event?: Json | null
          rc_anonymous_id: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_for?: string | null
          tokens: number
        }
        Update: {
          created_at?: string
          event_hash?: string
          event_type?: string
          id?: number
          product_id?: string
          raw_event?: Json | null
          rc_anonymous_id?: string
          resolved?: boolean
          resolved_at?: string | null
          resolved_for?: string | null
          tokens?: number
        }
        Relationships: []
      }
      consultation_content: {
        Row: {
          consultation_id: string
          created_at: string
          interpretation: string | null
          oracle_bones: Json | null
          session_id: string
          user_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          interpretation?: string | null
          oracle_bones?: Json | null
          session_id: string
          user_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          interpretation?: string | null
          oracle_bones?: Json | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_content_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_notes: {
        Row: {
          consultation_id: string | null
          created_at: string | null
          id: string
          note: string
          user_id: string | null
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          note: string
          user_id?: string | null
        }
        Update: {
          consultation_id?: string | null
          created_at?: string | null
          id?: string
          note?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_notes_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_sessions: {
        Row: {
          closed_at: string | null
          consultation_count: number | null
          created_at: string | null
          id: string
          language: string
          max_consultations: number
          public_sharing_id: string
          status: string | null
          theme_category: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          closed_at?: string | null
          consultation_count?: number | null
          created_at?: string | null
          id?: string
          language?: string
          max_consultations?: number
          public_sharing_id?: string
          status?: string | null
          theme_category?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          closed_at?: string | null
          consultation_count?: number | null
          created_at?: string | null
          id?: string
          language?: string
          max_consultations?: number
          public_sharing_id?: string
          status?: string | null
          theme_category?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          category: string
          changing_lines: number[]
          created_at: string | null
          id: string
          image_url: string | null
          interpretation_summary: string | null
          is_public: boolean | null
          language: string
          line_reading_system: string
          lines: Json
          mutation_rule: string
          oracle_type: string
          primary_hexagram_chinese: string
          primary_hexagram_name: string
          primary_hexagram_number: number
          public_sharing_id: string
          question: string
          session_id: string | null
          session_position: number
          share_count: number | null
          thumbnail_url: string | null
          transformed_hexagram_name: string | null
          transformed_hexagram_number: number | null
          translator: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          changing_lines: number[]
          created_at?: string | null
          id?: string
          image_url?: string | null
          interpretation_summary?: string | null
          is_public?: boolean | null
          language?: string
          line_reading_system?: string
          lines: Json
          mutation_rule: string
          oracle_type?: string
          primary_hexagram_chinese: string
          primary_hexagram_name: string
          primary_hexagram_number: number
          public_sharing_id?: string
          question: string
          session_id?: string | null
          session_position?: number
          share_count?: number | null
          thumbnail_url?: string | null
          transformed_hexagram_name?: string | null
          transformed_hexagram_number?: number | null
          translator?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          changing_lines?: number[]
          created_at?: string | null
          id?: string
          image_url?: string | null
          interpretation_summary?: string | null
          is_public?: boolean | null
          language?: string
          line_reading_system?: string
          lines?: Json
          mutation_rule?: string
          oracle_type?: string
          primary_hexagram_chinese?: string
          primary_hexagram_name?: string
          primary_hexagram_number?: number
          public_sharing_id?: string
          question?: string
          session_id?: string | null
          session_position?: number
          share_count?: number | null
          thumbnail_url?: string | null
          transformed_hexagram_name?: string | null
          transformed_hexagram_number?: number | null
          translator?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "consultation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          app_version: string | null
          category: string
          created_at: string
          description: string
          email: string | null
          id: string
          locale: string | null
          metadata: Json
          platform: string | null
        }
        Insert: {
          app_version?: string | null
          category: string
          created_at?: string
          description: string
          email?: string | null
          id?: string
          locale?: string | null
          metadata?: Json
          platform?: string | null
        }
        Update: {
          app_version?: string | null
          category?: string
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          locale?: string | null
          metadata?: Json
          platform?: string | null
        }
        Relationships: []
      }
      pattern_analyses: {
        Row: {
          analysis_text: string
          consultations_analyzed: number
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          analysis_text: string
          consultations_analyzed: number
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          analysis_text?: string
          consultations_analyzed?: number
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pattern_analyses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      query_credits: {
        Row: {
          credits_total: number
          credits_used: number | null
          id: string
          last_pack: string
          total_purchased: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          credits_total: number
          credits_used?: number | null
          id?: string
          last_pack?: string
          total_purchased?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          credits_total?: number
          credits_used?: number | null
          id?: string
          last_pack?: string
          total_purchased?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revenuecat_webhook_events: {
        Row: {
          app_user_id: string | null
          event_hash: string
          event_type: string | null
          id: number
          processed_at: string
        }
        Insert: {
          app_user_id?: string | null
          event_hash: string
          event_type?: string | null
          id?: number
          processed_at?: string
        }
        Update: {
          app_user_id?: string | null
          event_hash?: string
          event_type?: string | null
          id?: number
          processed_at?: string
        }
        Relationships: []
      }
      token_refund_log: {
        Row: {
          created_at: string
          id: number
          reason: string | null
          tokens: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          reason?: string | null
          tokens: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          reason?: string | null
          tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      trial_email_log: {
        Row: {
          email_hash: string
          first_granted_at: string
        }
        Insert: {
          email_hash: string
          first_granted_at?: string
        }
        Update: {
          email_hash?: string
          first_granted_at?: string
        }
        Relationships: []
      }
      two_factor_attempts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          success: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "two_factor_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_email_codes: {
        Row: {
          code_hash: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          code_hash: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
        }
        Update: {
          code_hash?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "two_factor_email_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      two_factor_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "two_factor_recovery_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_legal_acceptances: {
        Row: {
          accepted_at: string
          accepted_via: string
          created_at: string
          id: string
          privacy_version: string
          terms_version: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          accepted_via: string
          created_at?: string
          id?: string
          privacy_version: string
          terms_version: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          accepted_via?: string
          created_at?: string
          id?: string
          privacy_version?: string
          terms_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_legal_acceptances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trial_log: {
        Row: {
          granted_at: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          user_id: string
        }
        Update: {
          granted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trial_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          is_admin: boolean | null
          language: string | null
          phone_number: string | null
          phone_verified_at: string | null
          totp_last_used_step: number | null
          totp_secret: string | null
          totp_verified_at: string | null
          tour_v1_completed_at: string | null
          two_factor_enabled: boolean | null
          two_factor_method: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          language?: string | null
          phone_number?: string | null
          phone_verified_at?: string | null
          totp_last_used_step?: number | null
          totp_secret?: string | null
          totp_verified_at?: string | null
          tour_v1_completed_at?: string | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          language?: string | null
          phone_number?: string | null
          phone_verified_at?: string | null
          totp_last_used_step?: number | null
          totp_secret?: string | null
          totp_verified_at?: string | null
          tour_v1_completed_at?: string | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_email_registered: { Args: { p_email: string }; Returns: boolean }
      consume_token: {
        Args: { p_user_id: string; tokens_to_consume?: number }
        Returns: number
      }
      get_session_content_safe: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: {
          consultation_id: string
          interpretation: string
          oracle_bones: Json
        }[]
      }
      get_user_session_summaries: {
        Args: { p_user_id: string }
        Returns: {
          consultation_count: number
          first_consultation_at: string
          first_question: string
          language: string
          last_consultation_at: string
          public_sharing_id: string
          session_created_at: string
          session_id: string
          theme_category: string
          title: string
        }[]
      }
      grant_tokens: {
        Args: { p_pack_id: string; p_tokens: number; p_user_id: string }
        Returns: undefined
      }
      grant_tokens_idempotent: {
        Args: {
          p_event_hash: string
          p_event_type: string
          p_pack: string
          p_tokens: number
          p_user_id: string
        }
        Returns: string
      }
      init_free_user: { Args: { p_user_id: string }; Returns: undefined }
      persist_consultation_with_content: {
        Args: {
          p_category: string
          p_changing_lines: number[]
          p_id: string
          p_image_url: string
          p_interpretation: string
          p_interpretation_summary: string
          p_is_public: boolean
          p_language: string
          p_line_reading_system?: string
          p_lines: Json
          p_mutation_rule: string
          p_oracle_bones: Json
          p_oracle_type: string
          p_primary_hexagram_chinese: string
          p_primary_hexagram_name: string
          p_primary_hexagram_number: number
          p_question: string
          p_session_id: string
          p_session_position: number
          p_thumbnail_url: string
          p_transformed_hexagram_name: string
          p_transformed_hexagram_number: number
          p_translator: string
          p_user_id: string
        }
        Returns: string
      }
      random_public_id: { Args: { len?: number }; Returns: string }
      refund_token: {
        Args: { p_reason?: string; p_tokens: number; p_user_id: string }
        Returns: number
      }
      reset_2fa_recovery_codes: {
        Args: { p_hashed_codes: string[]; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
