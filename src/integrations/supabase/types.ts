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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          id: string
          patient_name: string
          phone: string
          reason: string
          rescheduled_date: string | null
          rescheduled_time: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          id?: string
          patient_name: string
          phone: string
          reason: string
          rescheduled_date?: string | null
          rescheduled_time?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          id?: string
          patient_name?: string
          phone?: string
          reason?: string
          rescheduled_date?: string | null
          rescheduled_time?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string
          id: string
          user_email: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_email?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_email?: string | null
        }
        Relationships: []
      }
      beds: {
        Row: {
          admitted_at: string | null
          bed_number: string
          created_at: string
          department_id: string | null
          id: string
          patient_name: string | null
          patient_phone: string | null
          status: string
          updated_at: string
          ward_type: string
        }
        Insert: {
          admitted_at?: string | null
          bed_number: string
          created_at?: string
          department_id?: string | null
          id?: string
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          updated_at?: string
          ward_type?: string
        }
        Update: {
          admitted_at?: string | null
          bed_number?: string
          created_at?: string
          department_id?: string | null
          id?: string
          patient_name?: string | null
          patient_phone?: string | null
          status?: string
          updated_at?: string
          ward_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      billing: {
        Row: {
          created_at: string
          id: string
          items: Json
          notes: string | null
          paid_amount: number
          patient_name: string
          patient_phone: string
          payment_method: string | null
          payment_status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          notes?: string | null
          paid_amount?: number
          patient_name: string
          patient_phone: string
          payment_method?: string | null
          payment_status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          notes?: string | null
          paid_amount?: number
          patient_name?: string
          patient_phone?: string
          payment_method?: string | null
          payment_status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      clinic_settings: {
        Row: {
          address: string
          clinic_name: string
          created_at: string
          doctor_name: string
          fees: string
          follow_up_fees: string
          id: string
          phone: string
          specialization: string
          timings: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          clinic_name?: string
          created_at?: string
          doctor_name?: string
          fees?: string
          follow_up_fees?: string
          id?: string
          phone?: string
          specialization?: string
          timings?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          clinic_name?: string
          created_at?: string
          doctor_name?: string
          fees?: string
          follow_up_fees?: string
          id?: string
          phone?: string
          specialization?: string
          timings?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          head_doctor: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          head_doctor?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          head_doctor?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      discharge_summaries: {
        Row: {
          admission_date: string
          clinical_notes: string | null
          created_at: string
          created_by: string | null
          department: string | null
          diagnosis: string
          discharge_date: string
          doctor_name: string
          follow_up_instructions: string | null
          id: string
          medications: string | null
          patient_name: string
          patient_phone: string
          status: string
          treatment: string | null
          updated_at: string
        }
        Insert: {
          admission_date: string
          clinical_notes?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          diagnosis: string
          discharge_date: string
          doctor_name: string
          follow_up_instructions?: string | null
          id?: string
          medications?: string | null
          patient_name: string
          patient_phone: string
          status?: string
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          admission_date?: string
          clinical_notes?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          diagnosis?: string
          discharge_date?: string
          doctor_name?: string
          follow_up_instructions?: string | null
          id?: string
          medications?: string | null
          patient_name?: string
          patient_phone?: string
          status?: string
          treatment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          new_date: string | null
          new_time: string | null
          old_date: string | null
          old_time: string | null
          patient_name: string
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          new_date?: string | null
          new_time?: string | null
          old_date?: string | null
          old_time?: string | null
          patient_name: string
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          new_date?: string | null
          new_time?: string | null
          old_date?: string | null
          old_time?: string | null
          patient_name?: string
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          created_at: string
          id: string
          last_visit: string | null
          name: string
          notes: string | null
          phone: string
          updated_at: string
          user_id: string
          visits: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_visit?: string | null
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
          user_id: string
          visits?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_visit?: string | null
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
          visits?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
