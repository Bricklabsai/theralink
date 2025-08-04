export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          message: string
          recipient_ids: string[] | null
          recipient_type: string
          sent_at: string
          subject: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          message: string
          recipient_ids?: string[] | null
          recipient_type: string
          sent_at?: string
          subject: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          message?: string
          recipient_ids?: string[] | null
          recipient_type?: string
          sent_at?: string
          subject?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          booking_request_id: string | null
          client_id: string
          client_notes: string | null
          created_at: string
          end_time: string
          id: string
          notes: string | null
          payment_id: string | null
          session_type: string
          start_time: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          booking_request_id?: string | null
          client_id: string
          client_notes?: string | null
          created_at?: string
          end_time: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          session_type: string
          start_time: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          booking_request_id?: string | null
          client_id?: string
          client_notes?: string | null
          created_at?: string
          end_time?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          session_type?: string
          start_time?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      blogs: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          created_by: string
          excerpt: string
          id: string
          image_url: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          created_by: string
          excerpt: string
          id?: string
          image_url?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          created_by?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          client_id: string
          created_at: string
          currency: string | null
          duration: number
          id: string
          message: string | null
          payment_amount: number | null
          payment_required: boolean
          rejected_reason: string | null
          requested_date: string
          requested_time: string
          session_type: string
          status: string
          therapist_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          currency?: string | null
          duration?: number
          id?: string
          message?: string | null
          payment_amount?: number | null
          payment_required?: boolean
          rejected_reason?: string | null
          requested_date: string
          requested_time: string
          session_type: string
          status?: string
          therapist_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          currency?: string | null
          duration?: number
          id?: string
          message?: string | null
          payment_amount?: number | null
          payment_required?: boolean
          rejected_reason?: string | null
          requested_date?: string
          requested_time?: string
          session_type?: string
          status?: string
          therapist_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          dashboard_type: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dashboard_type?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dashboard_type?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      content_management: {
        Row: {
          content: string
          content_type: string
          created_at: string
          created_by: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string
          created_by: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          dashboard_type: string
          id: string
          is_read: boolean
          message: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          dashboard_type: string
          id?: string
          is_read?: boolean
          message: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          dashboard_type?: string
          id?: string
          is_read?: boolean
          message?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      friend_details: {
        Row: {
          area_of_experience: string | null
          communication_preferences: string | null
          created_at: string
          experience_description: string | null
          friend_id: string
          id: string
          personal_story: string | null
          updated_at: string
        }
        Insert: {
          area_of_experience?: string | null
          communication_preferences?: string | null
          created_at?: string
          experience_description?: string | null
          friend_id: string
          id?: string
          personal_story?: string | null
          updated_at?: string
        }
        Update: {
          area_of_experience?: string | null
          communication_preferences?: string | null
          created_at?: string
          experience_description?: string | null
          friend_id?: string
          id?: string
          personal_story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_details_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          amount: number
          booking_request_id: string
          created_at: string
          currency: string
          id: string
          payment_method: string
          payment_reference: string | null
          status: string
          therapist_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          booking_request_id: string
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          payment_reference?: string | null
          status?: string
          therapist_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_request_id?: string
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          payment_reference?: string | null
          status?: string
          therapist_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_booking_request_id_fkey"
            columns: ["booking_request_id"]
            isOneToOne: false
            referencedRelation: "booking_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          profile_image_url: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string
          created_at: string
          id: string
          rating: number
          therapist_id: string
        }
        Insert: {
          client_id: string
          comment: string
          created_at?: string
          id?: string
          rating: number
          therapist_id: string
        }
        Update: {
          client_id?: string
          comment?: string
          created_at?: string
          id?: string
          rating?: number
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      session_notes: {
        Row: {
          appointment_id: string | null
          client_id: string | null
          content: string
          created_at: string
          id: string
          therapist_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          therapist_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          therapist_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_notes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          application_status: string | null
          availability: Json | null
          bio: string | null
          created_at: string | null
          education: string | null
          has_insurance: boolean | null
          hourly_rate: number | null
          id: string
          insurance_info: string | null
          is_community_therapist: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          license_number: string | null
          license_type: string | null
          preferred_currency: string | null
          rating: number | null
          session_formats: string[] | null
          specialization: string | null
          therapy_approaches: string[] | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          application_status?: string | null
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          has_insurance?: boolean | null
          hourly_rate?: number | null
          id: string
          insurance_info?: string | null
          is_community_therapist?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          license_type?: string | null
          preferred_currency?: string | null
          rating?: number | null
          session_formats?: string[] | null
          specialization?: string | null
          therapy_approaches?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          application_status?: string | null
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          education?: string | null
          has_insurance?: boolean | null
          hourly_rate?: number | null
          id?: string
          insurance_info?: string | null
          is_community_therapist?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          license_type?: string | null
          preferred_currency?: string | null
          rating?: number | null
          session_formats?: string[] | null
          specialization?: string | null
          therapy_approaches?: string[] | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference: string
          status: string
          therapist_id: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference: string
          status: string
          therapist_id?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference?: string
          status?: string
          therapist_id?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_sessions: {
        Row: {
          appointment_id: string
          client_id: string
          created_at: string
          ended_at: string | null
          id: string
          room_id: string
          room_token: string | null
          started_at: string | null
          status: string
          therapist_id: string
        }
        Insert: {
          appointment_id: string
          client_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          room_id: string
          room_token?: string | null
          started_at?: string | null
          status?: string
          therapist_id: string
        }
        Update: {
          appointment_id?: string
          client_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          room_id?: string
          room_token?: string | null
          started_at?: string | null
          status?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_contact_message: {
        Args: {
          p_name: string
          p_email: string
          p_subject: string
          p_message: string
          p_user_id?: string
        }
        Returns: undefined
      }
      insert_therapist_details: {
        Args: {
          p_therapist_id: string
          p_education: string
          p_license_number: string
          p_license_type: string
          p_therapy_approaches: string
          p_languages: string
          p_insurance_info: string
          p_session_formats: string
          p_has_insurance: boolean
        }
        Returns: undefined
      }
      update_therapist_community_status: {
        Args: { p_therapist_id: string; p_is_community_therapist: boolean }
        Returns: boolean
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
