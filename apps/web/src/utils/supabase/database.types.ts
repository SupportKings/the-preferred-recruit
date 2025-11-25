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
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt?: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_applications: {
        Row: {
          athlete_id: string | null
          commitment_date: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          last_interaction_at: string | null
          offer_date: string | null
          offer_notes: string | null
          origin_campaign_id: string | null
          origin_lead_list_id: string | null
          origin_lead_list_priority: number | null
          program_id: string | null
          scholarship_amount_per_year: number | null
          scholarship_percent: number | null
          stage: Database["public"]["Enums"]["application_stage_enum"] | null
          start_date: string | null
          university_id: string | null
          updated_at: string | null
        }
        Insert: {
          athlete_id?: string | null
          commitment_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_interaction_at?: string | null
          offer_date?: string | null
          offer_notes?: string | null
          origin_campaign_id?: string | null
          origin_lead_list_id?: string | null
          origin_lead_list_priority?: number | null
          program_id?: string | null
          scholarship_amount_per_year?: number | null
          scholarship_percent?: number | null
          stage?: Database["public"]["Enums"]["application_stage_enum"] | null
          start_date?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Update: {
          athlete_id?: string | null
          commitment_date?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_interaction_at?: string | null
          offer_date?: string | null
          offer_notes?: string | null
          origin_campaign_id?: string | null
          origin_lead_list_id?: string | null
          origin_lead_list_priority?: number | null
          program_id?: string | null
          scholarship_amount_per_year?: number | null
          scholarship_percent?: number | null
          stage?: Database["public"]["Enums"]["application_stage_enum"] | null
          start_date?: string | null
          university_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_applications_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_origin_campaign_id_fkey"
            columns: ["origin_campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_origin_lead_list_id_fkey"
            columns: ["origin_lead_list_id"]
            isOneToOne: false
            referencedRelation: "school_lead_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_applications_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_results: {
        Row: {
          altitude: boolean | null
          athlete_id: string | null
          date_recorded: string | null
          deleted_at: string | null
          deleted_by: string | null
          event_id: string | null
          hand_timed: boolean | null
          id: string
          internal_notes: string | null
          is_deleted: boolean | null
          location: string | null
          organized_event: boolean | null
          performance_mark: string | null
          wind: number | null
        }
        Insert: {
          altitude?: boolean | null
          athlete_id?: string | null
          date_recorded?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: string | null
          hand_timed?: boolean | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          location?: string | null
          organized_event?: boolean | null
          performance_mark?: string | null
          wind?: number | null
        }
        Update: {
          altitude?: boolean | null
          athlete_id?: string | null
          date_recorded?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          event_id?: string | null
          hand_timed?: boolean | null
          id?: string
          internal_notes?: string | null
          is_deleted?: boolean | null
          location?: string | null
          organized_event?: boolean | null
          performance_mark?: string | null
          wind?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_results_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_results_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_results_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      athletes: {
        Row: {
          act_score: number | null
          athlete_net_url: string | null
          city: string | null
          contact_email: string | null
          contract_date: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          discord_channel_id: string | null
          discord_channel_url: string | null
          discord_invite_code: string | null
          discord_user_id: string | null
          discord_username: string | null
          full_name: string
          gender: Database["public"]["Enums"]["athlete_gender_enum"] | null
          go_live_date: string | null
          google_drive_evaluation_form_url: string | null
          google_drive_folder_url: string | null
          gpa: number | null
          graduation_year: number | null
          high_school: string | null
          id: string
          initial_cash_collected_usd: number | null
          initial_contract_amount_usd: number | null
          initial_payment_type:
            | Database["public"]["Enums"]["payment_type_enum"]
            | null
          instagram_handle: string | null
          internal_notes: string | null
          is_deleted: boolean | null
          last_sales_call_at: string | null
          lead_source: string | null
          milesplit_url: string | null
          onboarding_form_data: Json | null
          phone: string | null
          run_kickoff_automations: boolean | null
          sales_call_note: string | null
          sales_call_recording_url: string | null
          sales_closer_id: string | null
          sales_setter_id: string | null
          sat_score: number | null
          sending_email_id: string | null
          state: string | null
          student_type: Database["public"]["Enums"]["student_type_enum"] | null
          updated_at: string | null
          year_entering_university: number | null
        }
        Insert: {
          act_score?: number | null
          athlete_net_url?: string | null
          city?: string | null
          contact_email?: string | null
          contract_date?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discord_channel_id?: string | null
          discord_channel_url?: string | null
          discord_invite_code?: string | null
          discord_user_id?: string | null
          discord_username?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["athlete_gender_enum"] | null
          go_live_date?: string | null
          google_drive_evaluation_form_url?: string | null
          google_drive_folder_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          high_school?: string | null
          id?: string
          initial_cash_collected_usd?: number | null
          initial_contract_amount_usd?: number | null
          initial_payment_type?:
            | Database["public"]["Enums"]["payment_type_enum"]
            | null
          instagram_handle?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_sales_call_at?: string | null
          lead_source?: string | null
          milesplit_url?: string | null
          onboarding_form_data?: Json | null
          phone?: string | null
          run_kickoff_automations?: boolean | null
          sales_call_note?: string | null
          sales_call_recording_url?: string | null
          sales_closer_id?: string | null
          sales_setter_id?: string | null
          sat_score?: number | null
          sending_email_id?: string | null
          state?: string | null
          student_type?: Database["public"]["Enums"]["student_type_enum"] | null
          updated_at?: string | null
          year_entering_university?: number | null
        }
        Update: {
          act_score?: number | null
          athlete_net_url?: string | null
          city?: string | null
          contact_email?: string | null
          contract_date?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discord_channel_id?: string | null
          discord_channel_url?: string | null
          discord_invite_code?: string | null
          discord_user_id?: string | null
          discord_username?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["athlete_gender_enum"] | null
          go_live_date?: string | null
          google_drive_evaluation_form_url?: string | null
          google_drive_folder_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          high_school?: string | null
          id?: string
          initial_cash_collected_usd?: number | null
          initial_contract_amount_usd?: number | null
          initial_payment_type?:
            | Database["public"]["Enums"]["payment_type_enum"]
            | null
          instagram_handle?: string | null
          internal_notes?: string | null
          is_deleted?: boolean | null
          last_sales_call_at?: string | null
          lead_source?: string | null
          milesplit_url?: string | null
          onboarding_form_data?: Json | null
          phone?: string | null
          run_kickoff_automations?: boolean | null
          sales_call_note?: string | null
          sales_call_recording_url?: string | null
          sales_closer_id?: string | null
          sales_setter_id?: string | null
          sat_score?: number | null
          sending_email_id?: string | null
          state?: string | null
          student_type?: Database["public"]["Enums"]["student_type_enum"] | null
          updated_at?: string | null
          year_entering_university?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athletes_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_sales_closer_id_fkey"
            columns: ["sales_closer_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_sales_setter_id_fkey"
            columns: ["sales_setter_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athletes_sending_email_id_fkey"
            columns: ["sending_email_id"]
            isOneToOne: false
            referencedRelation: "email_sending_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      [key: string]: any
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      application_stage_enum:
        | "intro"
        | "ongoing"
        | "visit"
        | "offer"
        | "committed"
        | "dropped"
      athlete_gender_enum: "male" | "female"
      campaign_lead_status_enum: "pending" | "replied" | "suppressed"
      campaign_status_enum:
        | "draft"
        | "active"
        | "paused"
        | "completed"
        | "exhausted"
      campaign_type_enum: "top" | "second_pass" | "third_pass" | "personal_best"
      event_group_enum:
        | "sprints"
        | "hurdles"
        | "distance"
        | "jumps"
        | "throws"
        | "relays"
        | "combined"
      event_unit_enum: "seconds" | "meters" | "points"
      payment_type_enum: "paid_in_full" | "installments" | "deposit" | "other"
      program_gender_enum: "men" | "women"
      program_scope_enum: "men" | "women" | "both" | "n/a"
      reply_type_enum: "call" | "text" | "email" | "in_person" | "other"
      student_type_enum: "domestic" | "international"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
