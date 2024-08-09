export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          admin: boolean
          user_profile_id: string
        }
        Insert: {
          admin?: boolean
          user_profile_id: string
        }
        Update: {
          admin?: boolean
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          account_name: string | null
          account_role: Database["public"]["Enums"]["account_role"]
          created_at: string | null
          id: string
          invitation_type: Database["public"]["Enums"]["invitation_type"]
          invited_by_user_id: string
          organization_id: string
          token: string
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          account_role: Database["public"]["Enums"]["account_role"]
          created_at?: string | null
          id?: string
          invitation_type: Database["public"]["Enums"]["invitation_type"]
          invited_by_user_id: string
          organization_id: string
          token?: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          account_role?: Database["public"]["Enums"]["account_role"]
          created_at?: string | null
          id?: string
          invitation_type?: Database["public"]["Enums"]["invitation_type"]
          invited_by_user_id?: string
          organization_id?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          logo_image_description: string | null
          logo_image_path: string | null
          logo_image_public_url: string | null
          name: string | null
          private_metadata: Json | null
          public_metadata: Json | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_image_description?: string | null
          logo_image_path?: string | null
          logo_image_public_url?: string | null
          name?: string | null
          private_metadata?: Json | null
          public_metadata?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          logo_image_description?: string | null
          logo_image_path?: string | null
          logo_image_public_url?: string | null
          name?: string | null
          private_metadata?: Json | null
          public_metadata?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_user: {
        Row: {
          account_role: Database["public"]["Enums"]["account_role"]
          organization_id: string
          user_id: string
        }
        Insert: {
          account_role: Database["public"]["Enums"]["account_role"]
          organization_id: string
          user_id: string
        }
        Update: {
          account_role?: Database["public"]["Enums"]["account_role"]
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_user_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_verified: {
        Row: {
          organization_id: string
          verified: boolean
        }
        Insert: {
          organization_id: string
          verified?: boolean
        }
        Update: {
          organization_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "organization_verified_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          description: string | null
          image_path: string
          image_public_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          image_path: string
          image_public_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          image_path?: string
          image_public_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          email: string | null
          id: string
        }
        Insert: {
          email?: string | null
          id: string
        }
        Update: {
          email?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: {
          lookup_invitation_token: string
        }
        Returns: Json
      }
      create_invitation: {
        Args: {
          organization_id: string
          account_role: Database["public"]["Enums"]["account_role"]
          invitation_type: Database["public"]["Enums"]["invitation_type"]
        }
        Returns: Json
      }
      create_organization: {
        Args: {
          name?: string
        }
        Returns: Json
      }
      current_user_account_role: {
        Args: {
          organization_id: string
        }
        Returns: Json
      }
      delete_invitation: {
        Args: {
          invitation_id: string
        }
        Returns: undefined
      }
      generate_token: {
        Args: {
          length: number
        }
        Returns: string
      }
      get_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_organization: {
        Args: {
          organization_id: string
        }
        Returns: Json
      }
      get_organization_invitations: {
        Args: {
          organization_id: string
          results_limit?: number
          results_offset?: number
        }
        Returns: Json
      }
      get_organization_members: {
        Args: {
          organization_id: string
          results_limit?: number
          results_offset?: number
        }
        Returns: Json
      }
      get_organizations: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_organizations_with_role: {
        Args: {
          passed_in_role?: Database["public"]["Enums"]["account_role"]
        }
        Returns: string[]
      }
      get_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string | null
          id: string
        }
      }
      has_role_for_product: {
        Args: {
          product_id: string
          account_role?: Database["public"]["Enums"]["account_role"]
        }
        Returns: boolean
      }
      has_role_on_organization: {
        Args: {
          organization_id: string
          account_role?: Database["public"]["Enums"]["account_role"]
        }
        Returns: boolean
      }
      is_verified_organization: {
        Args: {
          organization_id: string
        }
        Returns: boolean
      }
      lookup_invitation: {
        Args: {
          lookup_invitation_token: string
        }
        Returns: Json
      }
      remove_organization_member: {
        Args: {
          organization_id: string
          user_id: string
        }
        Returns: undefined
      }
      update_organization: {
        Args: {
          organization_id: string
          name?: string
          public_metadata?: Json
          replace_metadata?: boolean
        }
        Returns: Json
      }
      update_organization_user_role: {
        Args: {
          organization_id: string
          user_id: string
          new_account_role: Database["public"]["Enums"]["account_role"]
        }
        Returns: undefined
      }
    }
    Enums: {
      account_role: "owner" | "member"
      invitation_type: "one_time" | "24_hour"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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

