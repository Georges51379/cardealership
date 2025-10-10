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
      about_content: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          section_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          section_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          section_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      auctions: {
        Row: {
          car_name: string
          created_at: string | null
          created_by: string | null
          current_bid: number
          description: string | null
          end_time: string
          id: string
          image_url: string | null
          status: string | null
          total_bids: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          car_name: string
          created_at?: string | null
          created_by?: string | null
          current_bid?: number
          description?: string | null
          end_time: string
          id?: string
          image_url?: string | null
          status?: string | null
          total_bids?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          car_name?: string
          created_at?: string | null
          created_by?: string | null
          current_bid?: number
          description?: string | null
          end_time?: string
          id?: string
          image_url?: string | null
          status?: string | null
          total_bids?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          auction_id: string
          bid_amount: number
          bidder_email: string
          bidder_name: string
          created_at: string | null
          id: string
        }
        Insert: {
          auction_id: string
          bid_amount: number
          bidder_email: string
          bidder_name: string
          created_at?: string | null
          id?: string
        }
        Update: {
          auction_id?: string
          bid_amount?: number
          bidder_email?: string
          bidder_name?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          doors: number | null
          engine: string | null
          id: string
          image_hover_url: string | null
          image_url: string | null
          mileage: number | null
          name: string
          passengers: number | null
          price: number
          speed: string | null
          status: string | null
          transmission: string | null
          updated_at: string | null
          updated_by: string | null
          year: number | null
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          doors?: number | null
          engine?: string | null
          id?: string
          image_hover_url?: string | null
          image_url?: string | null
          mileage?: number | null
          name: string
          passengers?: number | null
          price: number
          speed?: string | null
          status?: string | null
          transmission?: string | null
          updated_at?: string | null
          updated_by?: string | null
          year?: number | null
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          doors?: number | null
          engine?: string | null
          id?: string
          image_hover_url?: string | null
          image_url?: string | null
          mileage?: number | null
          name?: string
          passengers?: number | null
          price?: number
          speed?: string | null
          status?: string | null
          transmission?: string | null
          updated_at?: string | null
          updated_by?: string | null
          year?: number | null
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address: string | null
          created_at: string | null
          email_addresses: Json | null
          id: string
          map_embed_url: string | null
          phone_numbers: Json | null
          status: string | null
          updated_at: string | null
          working_hours: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email_addresses?: Json | null
          id?: string
          map_embed_url?: string | null
          phone_numbers?: Json | null
          status?: string | null
          updated_at?: string | null
          working_hours?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email_addresses?: Json | null
          id?: string
          map_embed_url?: string | null
          phone_numbers?: Json | null
          status?: string | null
          updated_at?: string | null
          working_hours?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read_status: boolean | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read_status?: boolean | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read_status?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      home_content: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          order_index: number | null
          section_type: string
          status: string | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          section_type: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          order_index?: number | null
          section_type?: string
          status?: string | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_transactions: {
        Row: {
          amount: number
          auction_id: string | null
          car_id: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          id: string
          sale_type: string | null
          transaction_date: string | null
        }
        Insert: {
          amount: number
          auction_id?: string | null
          car_id?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          id?: string
          sale_type?: string | null
          transaction_date?: string | null
        }
        Update: {
          amount?: number
          auction_id?: string | null
          car_id?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          sale_type?: string | null
          transaction_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "auctions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          maintenance_mode: boolean | null
          site_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean | null
          site_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          maintenance_mode?: boolean | null
          site_title?: string | null
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
      assign_admin_role: {
        Args: { user_email: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
