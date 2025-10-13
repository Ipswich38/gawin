export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          credits_remaining: number
          max_agents: number
          max_workflows: number
          created_at: string
          updated_at: string
          last_seen: string | null
          preferences: Json
          usage_stats: Json
          billing_info: Json
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          credits_remaining?: number
          max_agents?: number
          max_workflows?: number
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          preferences?: Json
          usage_stats?: Json
          billing_info?: Json
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          credits_remaining?: number
          max_agents?: number
          max_workflows?: number
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          preferences?: Json
          usage_stats?: Json
          billing_info?: Json
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          owner_id: string
          subscription_tier: 'free' | 'pro' | 'enterprise'
          settings: Json
          billing_info: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          owner_id: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          billing_info?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          owner_id?: string
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          billing_info?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          permissions: Json
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      agents: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          version: string
          config: Json
          capabilities: Json
          integrations: Json
          icon: string | null
          color: string
          author_id: string | null
          organization_id: string | null
          is_public: boolean
          is_marketplace: boolean
          price_model: 'free' | 'paid' | 'subscription'
          price_amount: number
          downloads: number
          rating: number
          reviews_count: number
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          version?: string
          config?: Json
          capabilities?: Json
          integrations?: Json
          icon?: string | null
          color?: string
          author_id?: string | null
          organization_id?: string | null
          is_public?: boolean
          is_marketplace?: boolean
          price_model?: 'free' | 'paid' | 'subscription'
          price_amount?: number
          downloads?: number
          rating?: number
          reviews_count?: number
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          version?: string
          config?: Json
          capabilities?: Json
          integrations?: Json
          icon?: string | null
          color?: string
          author_id?: string | null
          organization_id?: string | null
          is_public?: boolean
          is_marketplace?: boolean
          price_model?: 'free' | 'paid' | 'subscription'
          price_amount?: number
          downloads?: number
          rating?: number
          reviews_count?: number
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          organization_id: string | null
          nodes: Json
          connections: Json
          settings: Json
          is_active: boolean
          is_public: boolean
          is_template: boolean
          tags: string[]
          execution_stats: Json
          created_at: string
          updated_at: string
          last_run_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          organization_id?: string | null
          nodes?: Json
          connections?: Json
          settings?: Json
          is_active?: boolean
          is_public?: boolean
          is_template?: boolean
          tags?: string[]
          execution_stats?: Json
          created_at?: string
          updated_at?: string
          last_run_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          organization_id?: string | null
          nodes?: Json
          connections?: Json
          settings?: Json
          is_active?: boolean
          is_public?: boolean
          is_template?: boolean
          tags?: string[]
          execution_stats?: Json
          created_at?: string
          updated_at?: string
          last_run_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      workflow_executions: {
        Row: {
          id: string
          workflow_id: string
          user_id: string
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          input_data: Json
          output_data: Json
          execution_log: Json
          error_message: string | null
          credits_used: number
          duration_ms: number | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          workflow_id: string
          user_id: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          input_data?: Json
          output_data?: Json
          execution_log?: Json
          error_message?: string | null
          credits_used?: number
          duration_ms?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          workflow_id?: string
          user_id?: string
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          input_data?: Json
          output_data?: Json
          execution_log?: Json
          error_message?: string | null
          credits_used?: number
          duration_ms?: number | null
          started_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          title: string | null
          messages: Json
          metadata: Json
          agent_config: Json
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          title?: string | null
          messages?: Json
          metadata?: Json
          agent_config?: Json
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          title?: string | null
          messages?: Json
          metadata?: Json
          agent_config?: Json
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          plan_name: string
          plan_amount: number
          plan_currency: string
          plan_interval: 'month' | 'year' | null
          status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'incomplete' | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan_name: string
          plan_amount: number
          plan_currency?: string
          plan_interval?: 'month' | 'year' | null
          status?: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'incomplete' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          plan_name?: string
          plan_amount?: number
          plan_currency?: string
          plan_interval?: 'month' | 'year' | null
          status?: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'incomplete' | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      usage_records: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          resource_type: string
          resource_id: string | null
          quantity: number
          credits_cost: number
          metadata: Json
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          resource_type: string
          resource_id?: string | null
          quantity?: number
          credits_cost?: number
          metadata?: Json
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          resource_type?: string
          resource_id?: string | null
          quantity?: number
          credits_cost?: number
          metadata?: Json
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          name: string
          key_hash: string
          key_prefix: string
          permissions: Json
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          name: string
          key_hash: string
          key_prefix: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          name?: string
          key_hash?: string
          key_prefix?: string
          permissions?: Json
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
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