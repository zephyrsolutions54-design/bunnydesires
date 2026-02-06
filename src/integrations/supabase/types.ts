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
      calls: {
        Row: {
          coins_per_minute: number | null
          coins_spent: number | null
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          id: string
          initiator_id: string
          rated_by_user: boolean | null
          rating_given: number | null
          rating_submitted_at: string | null
          receiver_id: string
          start_time: string | null
          status: Database["public"]["Enums"]["call_status"]
        }
        Insert: {
          coins_per_minute?: number | null
          coins_spent?: number | null
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          initiator_id: string
          rated_by_user?: boolean | null
          rating_given?: number | null
          rating_submitted_at?: string | null
          receiver_id: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["call_status"]
        }
        Update: {
          coins_per_minute?: number | null
          coins_spent?: number | null
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          initiator_id?: string
          rated_by_user?: boolean | null
          rating_given?: number | null
          rating_submitted_at?: string | null
          receiver_id?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["call_status"]
        }
        Relationships: [
          {
            foreignKeyName: "calls_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_packages: {
        Row: {
          bonus_percent: number | null
          coins: number
          created_at: string
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_inr: number
        }
        Insert: {
          bonus_percent?: number | null
          coins: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_inr: number
        }
        Update: {
          bonus_percent?: number | null
          coins?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_inr?: number
        }
        Relationships: []
      }
      earnings: {
        Row: {
          available_balance: number
          call_earnings: number
          created_at: string
          gift_earnings: number
          id: string
          total_earnings: number
          updated_at: string
          user_id: string
          withdrawn_amount: number
        }
        Insert: {
          available_balance?: number
          call_earnings?: number
          created_at?: string
          gift_earnings?: number
          id?: string
          total_earnings?: number
          updated_at?: string
          user_id: string
          withdrawn_amount?: number
        }
        Update: {
          available_balance?: number
          call_earnings?: number
          created_at?: string
          gift_earnings?: number
          id?: string
          total_earnings?: number
          updated_at?: string
          user_id?: string
          withdrawn_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "earnings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_types: {
        Row: {
          coins_cost: number
          created_at: string
          emoji: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          coins_cost: number
          created_at?: string
          emoji: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          coins_cost?: number
          created_at?: string
          emoji?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      gifts: {
        Row: {
          call_id: string | null
          coins_amount: number
          created_at: string
          gift_name: string
          gift_type: string
          id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          call_id?: string | null
          coins_amount: number
          created_at?: string
          gift_name: string
          gift_type: string
          id?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          call_id?: string | null
          coins_amount?: number
          created_at?: string
          gift_name?: string
          gift_type?: string
          id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          current_earnings_rate: number | null
          email: string
          gender: Database["public"]["Enums"]["user_gender"]
          id: string
          is_online: boolean | null
          is_verified: boolean | null
          language: string | null
          name: string
          rating: number | null
          rating_breakdown: Json | null
          rating_tier: Database["public"]["Enums"]["rating_tier"] | null
          total_ratings: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          current_earnings_rate?: number | null
          email: string
          gender: Database["public"]["Enums"]["user_gender"]
          id: string
          is_online?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          name: string
          rating?: number | null
          rating_breakdown?: Json | null
          rating_tier?: Database["public"]["Enums"]["rating_tier"] | null
          total_ratings?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          current_earnings_rate?: number | null
          email?: string
          gender?: Database["public"]["Enums"]["user_gender"]
          id?: string
          is_online?: boolean | null
          is_verified?: boolean | null
          language?: string | null
          name?: string
          rating?: number | null
          rating_breakdown?: Json | null
          rating_tier?: Database["public"]["Enums"]["rating_tier"] | null
          total_ratings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          call_id: string
          created_at: string
          feedback: string | null
          from_user_id: string
          id: string
          stars: number
          to_user_id: string
        }
        Insert: {
          call_id: string
          created_at?: string
          feedback?: string | null
          from_user_id: string
          id?: string
          stars: number
          to_user_id: string
        }
        Update: {
          call_id?: string
          created_at?: string
          feedback?: string | null
          from_user_id?: string
          id?: string
          stars?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: true
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          coins: number
          created_at: string
          description: string | null
          id: string
          payment_id: string | null
          related_call_id: string | null
          related_user_id: string | null
          status: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          coins: number
          created_at?: string
          description?: string | null
          id?: string
          payment_id?: string | null
          related_call_id?: string | null
          related_user_id?: string | null
          status?: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          coins?: number
          created_at?: string
          description?: string | null
          id?: string
          payment_id?: string | null
          related_call_id?: string | null
          related_user_id?: string | null
          status?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_purchased: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_purchased?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number
          amount_inr: number
          id: string
          notes: string | null
          payment_details: Json
          payment_method: string
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          amount: number
          amount_inr: number
          id?: string
          notes?: string | null
          payment_details: Json
          payment_method: string
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          amount?: number
          amount_inr?: number
          id?: string
          notes?: string | null
          payment_details?: Json
          payment_method?: string
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_earnings_rate: {
        Args: { avg_rating: number }
        Returns: {
          coins_per_min: number
          tier: Database["public"]["Enums"]["rating_tier"]
        }[]
      }
      get_user_gender: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_gender"]
      }
      is_female: { Args: { user_id: string }; Returns: boolean }
      is_male: { Args: { user_id: string }; Returns: boolean }
      is_owner: { Args: { resource_user_id: string }; Returns: boolean }
    }
    Enums: {
      call_status: "pending" | "active" | "ended" | "missed" | "declined"
      rating_tier: "platinum" | "gold" | "silver" | "bronze" | "standard"
      transaction_type:
        | "coin_purchase"
        | "call_deduction"
        | "gift_sent"
        | "gift_received"
        | "earnings_credit"
        | "withdrawal"
      user_gender: "male" | "female"
      withdrawal_status: "pending" | "processing" | "completed" | "rejected"
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
      call_status: ["pending", "active", "ended", "missed", "declined"],
      rating_tier: ["platinum", "gold", "silver", "bronze", "standard"],
      transaction_type: [
        "coin_purchase",
        "call_deduction",
        "gift_sent",
        "gift_received",
        "earnings_credit",
        "withdrawal",
      ],
      user_gender: ["male", "female"],
      withdrawal_status: ["pending", "processing", "completed", "rejected"],
    },
  },
} as const
