export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliate_transactions: {
        Row: {
          advertiser_id: string | null
          affiliate_network: string
          cashback_amount: number
          cashback_percent: number
          click_reference: string
          commission_amount: number | null
          confirmation_date: string | null
          created_at: string | null
          currency: string | null
          fan_token_id: string | null
          id: string
          nft_contract_address: string | null
          nft_metadata: Json | null
          nft_mint_status: string | null
          nft_token_id: string | null
          nft_transaction_hash: string | null
          order_id: string | null
          partner_id: string
          raw_data: Json | null
          sale_amount: number
          status: string | null
          transaction_date: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          advertiser_id?: string | null
          affiliate_network: string
          cashback_amount: number
          cashback_percent: number
          click_reference: string
          commission_amount?: number | null
          confirmation_date?: string | null
          created_at?: string | null
          currency?: string | null
          fan_token_id?: string | null
          id?: string
          nft_contract_address?: string | null
          nft_metadata?: Json | null
          nft_mint_status?: string | null
          nft_token_id?: string | null
          nft_transaction_hash?: string | null
          order_id?: string | null
          partner_id: string
          raw_data?: Json | null
          sale_amount: number
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          advertiser_id?: string | null
          affiliate_network?: string
          cashback_amount?: number
          cashback_percent?: number
          click_reference?: string
          commission_amount?: number | null
          confirmation_date?: string | null
          created_at?: string | null
          currency?: string | null
          fan_token_id?: string | null
          id?: string
          nft_contract_address?: string | null
          nft_metadata?: Json | null
          nft_mint_status?: string | null
          nft_token_id?: string | null
          nft_transaction_hash?: string | null
          order_id?: string | null
          partner_id?: string
          raw_data?: Json | null
          sale_amount?: number
          status?: string | null
          transaction_date?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner_id"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "wallet_users"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_tokens: {
        Row: {
          category: string
          chiliz_contract: string | null
          coingecko_id: string | null
          created_at: string | null
          description: string | null
          id: string
          logo: string | null
          name: string
          symbol: string
        }
        Insert: {
          category: string
          chiliz_contract?: string | null
          coingecko_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name: string
          symbol: string
        }
        Update: {
          category?: string
          chiliz_contract?: string | null
          coingecko_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          awin_advertiser_id: string | null
          base_rate: number
          cashback_by_category: Json | null
          category: string | null
          color: string | null
          country: string[]
          featured: boolean | null
          id: string
          logo: string | null
          name: string
          rakuten_advertiser_id: string | null
          url: string | null
        }
        Insert: {
          awin_advertiser_id?: string | null
          base_rate?: number
          cashback_by_category?: Json | null
          category?: string | null
          color?: string | null
          country?: string[]
          featured?: boolean | null
          id?: string
          logo?: string | null
          name: string
          rakuten_advertiser_id?: string | null
          url?: string | null
        }
        Update: {
          awin_advertiser_id?: string | null
          base_rate?: number
          cashback_by_category?: Json | null
          category?: string | null
          color?: string | null
          country?: string[]
          featured?: boolean | null
          id?: string
          logo?: string | null
          name?: string
          rakuten_advertiser_id?: string | null
          url?: string | null
        }
        Relationships: []
      }
      postback_logs: {
        Row: {
          affiliate_network: string
          created_at: string | null
          error_message: string | null
          id: string
          processed: boolean | null
          raw_payload: Json
          transaction_id: string | null
        }
        Insert: {
          affiliate_network: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed?: boolean | null
          raw_payload: Json
          transaction_id?: string | null
        }
        Update: {
          affiliate_network?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          processed?: boolean | null
          raw_payload?: Json
          transaction_id?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          cashback_amount: number
          cashback_percent: number
          currency: string
          date: string
          id: string
          partner_id: string
          purchase_value: number
          status: string | null
          wallet_address: string
        }
        Insert: {
          cashback_amount: number
          cashback_percent: number
          currency?: string
          date?: string
          id?: string
          partner_id: string
          purchase_value: number
          status?: string | null
          wallet_address: string
        }
        Update: {
          cashback_amount?: number
          cashback_percent?: number
          currency?: string
          date?: string
          id?: string
          partner_id?: string
          purchase_value?: number
          status?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "v_affiliate_transactions"
            referencedColumns: ["user_wallet_address"]
          },
          {
            foreignKeyName: "purchases_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "wallet_users"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      store_clicks: {
        Row: {
          clicked_at: string
          id: string
          partner_id: string
          wallet_address: string
        }
        Insert: {
          clicked_at?: string
          id?: string
          partner_id: string
          wallet_address: string
        }
        Update: {
          clicked_at?: string
          id?: string
          partner_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_clicks_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_affiliate_transactions"
            referencedColumns: ["user_wallet_address"]
          },
          {
            foreignKeyName: "user_roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "wallet_users"
            referencedColumns: ["wallet_address"]
          },
          {
            foreignKeyName: "user_roles_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "v_affiliate_transactions"
            referencedColumns: ["user_wallet_address"]
          },
          {
            foreignKeyName: "user_roles_wallet_address_fkey"
            columns: ["wallet_address"]
            isOneToOne: false
            referencedRelation: "wallet_users"
            referencedColumns: ["wallet_address"]
          },
        ]
      }
      wallet_users: {
        Row: {
          cashback_bonus: number | null
          created_at: string | null
          default_currency: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          name: string | null
          staked_tokens: number | null
          staking_level: string | null
          wallet_address: string
        }
        Insert: {
          cashback_bonus?: number | null
          created_at?: string | null
          default_currency?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          staked_tokens?: number | null
          staking_level?: string | null
          wallet_address: string
        }
        Update: {
          cashback_bonus?: number | null
          created_at?: string | null
          default_currency?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          name?: string | null
          staked_tokens?: number | null
          staking_level?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_affiliate_transactions: {
        Row: {
          advertiser_id: string | null
          affiliate_network: string | null
          cashback_amount: number | null
          cashback_percent: number | null
          click_reference: string | null
          commission_amount: number | null
          confirmation_date: string | null
          created_at: string | null
          currency: string | null
          id: string | null
          order_id: string | null
          partner_base_rate: number | null
          partner_id: string | null
          partner_logo: string | null
          partner_name: string | null
          partner_url: string | null
          raw_data: Json | null
          sale_amount: number | null
          status: string | null
          transaction_date: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
          user_wallet_address: string | null
          wallet_address: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_partner_id"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "wallet_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_monthly_report: {
        Args: { month_year: string }
        Returns: {
          month_start: string
          total_transactions: number
          total_sales: number
          total_cashback: number
          awin_transactions: number
          rakuten_transactions: number
          unique_users: number
        }[]
      }
      get_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_top_partners: {
        Args: { limit_count?: number }
        Returns: {
          partner_id: string
          partner_name: string
          transaction_count: number
          total_sales: number
          total_cashback: number
          avg_transaction_value: number
        }[]
      }
      get_user_transaction_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
      is_admin: {
        Args: { check_wallet_address: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user"],
    },
  },
} as const
