export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          lead_type: Database["public"]["Enums"]["lead_type"];
          message: string | null;
          name: string;
          phone: string;
          source: string | null;
          utm_campaign: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          vehicle_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          lead_type: Database["public"]["Enums"]["lead_type"];
          message?: string | null;
          name: string;
          phone: string;
          source?: string | null;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          vehicle_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          lead_type?: Database["public"]["Enums"]["lead_type"];
          message?: string | null;
          name?: string;
          phone?: string;
          source?: string | null;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          vehicle_id?: string | null;
        };
        Relationships: [];
      };
      lead_inbox_state: {
        Row: {
          id: string;
          last_contacted_at: string | null;
          source_id: string;
          source_type: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          last_contacted_at?: string | null;
          source_id: string;
          source_type: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          last_contacted_at?: string | null;
          source_id?: string;
          source_type?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          address_line: string;
          city: string;
          created_at: string;
          email: string | null;
          hours: string;
          id: string;
          is_primary: boolean;
          map_url: string | null;
          name: string;
          phone: string;
        };
        Insert: {
          address_line: string;
          city: string;
          created_at?: string;
          email?: string | null;
          hours: string;
          id?: string;
          is_primary?: boolean;
          map_url?: string | null;
          name: string;
          phone: string;
        };
        Update: {
          address_line?: string;
          city?: string;
          created_at?: string;
          email?: string | null;
          hours?: string;
          id?: string;
          is_primary?: boolean;
          map_url?: string | null;
          name?: string;
          phone?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          created_at: string;
          customer_name: string;
          featured: boolean;
          id: string;
          quote: string;
          rating: number;
          sort_order: number;
          vehicle_label: string | null;
        };
        Insert: {
          created_at?: string;
          customer_name: string;
          featured?: boolean;
          id?: string;
          quote: string;
          rating?: number;
          sort_order?: number;
          vehicle_label?: string | null;
        };
        Update: {
          created_at?: string;
          customer_name?: string;
          featured?: boolean;
          id?: string;
          quote?: string;
          rating?: number;
          sort_order?: number;
          vehicle_label?: string | null;
        };
        Relationships: [];
      };
      test_drive_requests: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          message: string | null;
          name: string;
          phone: string;
          preferred_date: string | null;
          preferred_time: string | null;
          vehicle_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name: string;
          phone: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          vehicle_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          vehicle_id?: string | null;
        };
        Relationships: [];
      };
      trade_in_requests: {
        Row: {
          condition_notes: string | null;
          created_at: string;
          current_vehicle_make: string;
          current_vehicle_mileage: number | null;
          current_vehicle_model: string;
          current_vehicle_year: number;
          desired_vehicle_id: string | null;
          email: string | null;
          id: string;
          message: string | null;
          name: string;
          phone: string;
        };
        Insert: {
          condition_notes?: string | null;
          created_at?: string;
          current_vehicle_make: string;
          current_vehicle_mileage?: number | null;
          current_vehicle_model: string;
          current_vehicle_year: number;
          desired_vehicle_id?: string | null;
          email?: string | null;
          id?: string;
          message?: string | null;
          name: string;
          phone: string;
        };
        Update: {
          condition_notes?: string | null;
          created_at?: string;
          current_vehicle_make?: string;
          current_vehicle_mileage?: number | null;
          current_vehicle_model?: string;
          current_vehicle_year?: number;
          desired_vehicle_id?: string | null;
          email?: string | null;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string;
        };
        Relationships: [];
      };
      vehicle_images: {
        Row: {
          alt_text: string | null;
          cloudinary_public_id: string | null;
          created_at: string;
          id: string;
          image_url: string;
          is_hero: boolean;
          sort_order: number;
          vehicle_id: string;
        };
        Insert: {
          alt_text?: string | null;
          cloudinary_public_id?: string | null;
          created_at?: string;
          id?: string;
          image_url: string;
          is_hero?: boolean;
          sort_order?: number;
          vehicle_id: string;
        };
        Update: {
          alt_text?: string | null;
          cloudinary_public_id?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string;
          is_hero?: boolean;
          sort_order?: number;
          vehicle_id?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          body_type: string | null;
          color: string | null;
          condition: string;
          created_at: string;
          description: string;
          drive_type: string | null;
          engine_capacity: string | null;
          featured: boolean;
          fuel_type: string;
          hero_image_url: string | null;
          id: string;
          location_id: string | null;
          make: string;
          mileage: number;
          model: string;
          negotiable: boolean;
          price: number;
          slug: string;
          stock_code: string;
          status: Database["public"]["Enums"]["vehicle_status"];
          stock_category: Database["public"]["Enums"]["stock_category"];
          title: string;
          transmission: string;
          updated_at: string;
          year: number;
        };
        Insert: {
          body_type?: string | null;
          color?: string | null;
          condition: string;
          created_at?: string;
          description: string;
          drive_type?: string | null;
          engine_capacity?: string | null;
          featured?: boolean;
          fuel_type: string;
          hero_image_url?: string | null;
          id?: string;
          location_id?: string | null;
          make: string;
          mileage?: number;
          model: string;
          negotiable?: boolean;
          price?: number;
          slug: string;
          stock_code: string;
          status?: Database["public"]["Enums"]["vehicle_status"];
          stock_category: Database["public"]["Enums"]["stock_category"];
          title: string;
          transmission: string;
          updated_at?: string;
          year: number;
        };
        Update: {
          body_type?: string | null;
          color?: string | null;
          condition?: string;
          created_at?: string;
          description?: string;
          drive_type?: string | null;
          engine_capacity?: string | null;
          featured?: boolean;
          fuel_type?: string;
          hero_image_url?: string | null;
          id?: string;
          location_id?: string | null;
          make?: string;
          mileage?: number;
          model?: string;
          negotiable?: boolean;
          price?: number;
          slug?: string;
          stock_code?: string;
          status?: Database["public"]["Enums"]["vehicle_status"];
          stock_category?: Database["public"]["Enums"]["stock_category"];
          title?: string;
          transmission?: string;
          updated_at?: string;
          year?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: {
          uid: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      lead_type: "quote" | "contact" | "financing";
      stock_category:
        | "new"
        | "used"
        | "imported"
        | "available_for_importation"
        | "traded_in";
      vehicle_status: "draft" | "published" | "sold" | "unpublished";
    };
    CompositeTypes: Record<string, never>;
  };
}
