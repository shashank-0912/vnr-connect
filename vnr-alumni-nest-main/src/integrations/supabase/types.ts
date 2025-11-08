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
      alumni_posts: {
        Row: {
          author_id: string | null
          company: string
          content: string
          created_at: string | null
          difficulty: string | null
          id: string
          questions: string[] | null
          role: string
          tags: string[] | null
          year: number | null
        }
        Insert: {
          author_id?: string | null
          company: string
          content: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          questions?: string[] | null
          role: string
          tags?: string[] | null
          year?: number | null
        }
        Update: {
          author_id?: string | null
          company?: string
          content?: string
          created_at?: string | null
          difficulty?: string | null
          id?: string
          questions?: string[] | null
          role?: string
          tags?: string[] | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alumni_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_assignments: {
        Row: {
          badge_id: string
          given_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          given_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          given_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_assignments_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          code: string
          description: string | null
          icon: string | null
          id: string
          label: string
        }
        Insert: {
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          label: string
        }
        Update: {
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          end_at: string
          id: string
          meet_url: string | null
          mentee_id: string | null
          mentor_id: string | null
          notes_url: string | null
          room_id: string | null
          start_at: string
        }
        Insert: {
          created_at?: string | null
          end_at: string
          id?: string
          meet_url?: string | null
          mentee_id?: string | null
          mentor_id?: string | null
          notes_url?: string | null
          room_id?: string | null
          start_at: string
        }
        Update: {
          created_at?: string | null
          end_at?: string
          id?: string
          meet_url?: string | null
          mentee_id?: string | null
          mentor_id?: string | null
          notes_url?: string | null
          room_id?: string | null
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mentorship_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          description: string | null
          eligibility: string | null
          id: string
          link: string | null
          organizer: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          description?: string | null
          eligibility?: string | null
          id?: string
          link?: string | null
          organizer: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          description?: string | null
          eligibility?: string | null
          id?: string
          link?: string | null
          organizer?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internships: {
        Row: {
          company: string
          created_at: string | null
          id: string
          link: string
          recommended_by_alumni: boolean | null
          tags: string[] | null
          title: string
        }
        Insert: {
          company: string
          created_at?: string | null
          id?: string
          link: string
          recommended_by_alumni?: boolean | null
          tags?: string[] | null
          title: string
        }
        Update: {
          company?: string
          created_at?: string | null
          id?: string
          link?: string
          recommended_by_alumni?: boolean | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      mentorship_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_private: boolean | null
          member_ids: string[] | null
          name: string
          topic: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_private?: boolean | null
          member_ids?: string[] | null
          name: string
          topic: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_private?: boolean | null
          member_ids?: string[] | null
          name?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action: string
          admin_id: string | null
          id: string
          item_id: string
          item_type: string
          reason: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          id?: string
          item_id: string
          item_type: string
          reason?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          id?: string
          item_id?: string
          item_type?: string
          reason?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          seen: boolean | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          seen?: boolean | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          seen?: boolean | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          batch: string | null
          branch: string | null
          company: string | null
          created_at: string | null
          email: string
          headline: string | null
          id: string
          image: string | null
          interests: string[] | null
          name: string
          reputation: number | null
          role: Database["public"]["Enums"]["app_role"] | null
          skills: string[] | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          batch?: string | null
          branch?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          headline?: string | null
          id: string
          image?: string | null
          interests?: string[] | null
          name: string
          reputation?: number | null
          role?: Database["public"]["Enums"]["app_role"] | null
          skills?: string[] | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          batch?: string | null
          branch?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          headline?: string | null
          id?: string
          image?: string | null
          interests?: string[] | null
          name?: string
          reputation?: number | null
          role?: Database["public"]["Enums"]["app_role"] | null
          skills?: string[] | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      queries: {
        Row: {
          anonymous: boolean | null
          author_id: string | null
          category: Database["public"]["Enums"]["query_category"]
          created_at: string | null
          flags: number | null
          hidden: boolean | null
          id: string
          status: Database["public"]["Enums"]["query_status"] | null
          tags: string[] | null
          text: string
          updated_at: string | null
          votes: number | null
        }
        Insert: {
          anonymous?: boolean | null
          author_id?: string | null
          category: Database["public"]["Enums"]["query_category"]
          created_at?: string | null
          flags?: number | null
          hidden?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["query_status"] | null
          tags?: string[] | null
          text: string
          updated_at?: string | null
          votes?: number | null
        }
        Update: {
          anonymous?: boolean | null
          author_id?: string | null
          category?: Database["public"]["Enums"]["query_category"]
          created_at?: string | null
          flags?: number | null
          hidden?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["query_status"] | null
          tags?: string[] | null
          text?: string
          updated_at?: string | null
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "queries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          is_accepted: boolean | null
          query_id: string | null
          text: string
          votes: number | null
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          query_id?: string | null
          text: string
          votes?: number | null
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          query_id?: string | null
          text?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "queries"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          anonymous: boolean | null
          attachment_url: string | null
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
        }
        Insert: {
          anonymous?: boolean | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
        }
        Update: {
          anonymous?: boolean | null
          attachment_url?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          branch: string
          file_url: string
          id: string
          semester: number
          subject: string
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          uploaded_at: string | null
          uploaded_by: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          branch: string
          file_url: string
          id?: string
          semester: number
          subject: string
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          branch?: string
          file_url?: string
          id?: string
          semester?: number
          subject?: string
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          uploaded_at?: string | null
          uploaded_by?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_verified_by_fkey"
            columns: ["verified_by"]
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
      [_ in never]: never
    }
    Enums: {
      app_role:
        | "GUEST"
        | "STUDENT"
        | "ALUMNI"
        | "FACULTY"
        | "MODERATOR"
        | "ADMIN"
      query_category:
        | "ACADEMICS"
        | "INTERNSHIPS"
        | "ADMIN"
        | "PROJECT"
        | "EVENTS"
      query_status: "OPEN" | "SOLVED"
      resource_type:
        | "NOTES"
        | "OLD_PAPER"
        | "MODEL_PAPER"
        | "CONCEPTS"
        | "EXTRA"
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
      app_role: ["GUEST", "STUDENT", "ALUMNI", "FACULTY", "MODERATOR", "ADMIN"],
      query_category: [
        "ACADEMICS",
        "INTERNSHIPS",
        "ADMIN",
        "PROJECT",
        "EVENTS",
      ],
      query_status: ["OPEN", "SOLVED"],
      resource_type: ["NOTES", "OLD_PAPER", "MODEL_PAPER", "CONCEPTS", "EXTRA"],
    },
  },
} as const
