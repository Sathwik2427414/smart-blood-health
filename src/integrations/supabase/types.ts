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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blood_units: {
        Row: {
          blood_group: string
          collected_date: string
          component_type: string
          created_at: string
          donor_id: string
          donor_name: string
          expiry_date: string
          id: string
          lab_test_id: string | null
          status: string
        }
        Insert: {
          blood_group: string
          collected_date: string
          component_type?: string
          created_at?: string
          donor_id: string
          donor_name: string
          expiry_date: string
          id: string
          lab_test_id?: string | null
          status?: string
        }
        Update: {
          blood_group?: string
          collected_date?: string
          component_type?: string
          created_at?: string
          donor_id?: string
          donor_name?: string
          expiry_date?: string
          id?: string
          lab_test_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "blood_units_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          address: string
          age: number
          blood_group: string
          contact: string
          created_at: string
          eligible: boolean
          gender: string
          id: string
          last_donation_date: string
          name: string
        }
        Insert: {
          address?: string
          age: number
          blood_group: string
          contact?: string
          created_at?: string
          eligible?: boolean
          gender: string
          id: string
          last_donation_date: string
          name: string
        }
        Update: {
          address?: string
          age?: number
          blood_group?: string
          contact?: string
          created_at?: string
          eligible?: boolean
          gender?: string
          id?: string
          last_donation_date?: string
          name?: string
        }
        Relationships: []
      }
      lab_tests: {
        Row: {
          blood_group: string
          blood_unit_id: string | null
          created_at: string
          date: string
          donor_name: string
          hematocrit: number
          hemoglobin: number
          id: string
          mch: number
          mchc: number
          mcv: number
          platelet_count: number
          rbc_count: number
          result: string
          wbc_count: number
        }
        Insert: {
          blood_group: string
          blood_unit_id?: string | null
          created_at?: string
          date: string
          donor_name: string
          hematocrit: number
          hemoglobin: number
          id: string
          mch: number
          mchc: number
          mcv: number
          platelet_count: number
          rbc_count: number
          result?: string
          wbc_count: number
        }
        Update: {
          blood_group?: string
          blood_unit_id?: string | null
          created_at?: string
          date?: string
          donor_name?: string
          hematocrit?: number
          hemoglobin?: number
          id?: string
          mch?: number
          mchc?: number
          mcv?: number
          platelet_count?: number
          rbc_count?: number
          result?: string
          wbc_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          date: string
          donor_id: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          date: string
          donor_id?: string | null
          id: string
          message: string
          read?: boolean
          title: string
          type: string
        }
        Update: {
          created_at?: string
          date?: string
          donor_id?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          confidence: number
          created_at: string
          date: string
          description: string
          disease: string
          donor_name: string
          id: string
          lab_test_id: string
          severity: string
        }
        Insert: {
          confidence: number
          created_at?: string
          date: string
          description?: string
          disease: string
          donor_name: string
          id: string
          lab_test_id: string
          severity: string
        }
        Update: {
          confidence?: number
          created_at?: string
          date?: string
          description?: string
          disease?: string
          donor_name?: string
          id?: string
          lab_test_id?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_lab_test_id_fkey"
            columns: ["lab_test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
        ]
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
