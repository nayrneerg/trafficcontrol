export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'agency_admin' | 'client_viewer';
          org_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      integration_credentials: {
        Row: {
          id: string;
          org_id: string;
          platform: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string | null;
          scopes: string[] | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['integration_credentials']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['integration_credentials']['Insert']>;
      };
      metrics_cache: {
        Row: {
          id: string;
          org_id: string;
          platform: string;
          metric_date: string;
          spend: number | null;
          impressions: number | null;
          clicks: number | null;
          conversions: number | null;
          revenue: number | null;
          roas: number | null;
          cpl: number | null;
          ctr: number | null;
          cpc: number | null;
          raw_data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['metrics_cache']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['metrics_cache']['Insert']>;
      };
    };
  };
}
