export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'trainer' | 'client'
          full_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'trainer' | 'client'
          full_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'trainer' | 'client'
          full_name?: string
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      trainers: {
        Row: {
          id: string
          bio: string | null
          specialties: string[] | null
          instagram_url: string | null
          website_url: string | null
        }
        Insert: {
          id: string
          bio?: string | null
          specialties?: string[] | null
          instagram_url?: string | null
          website_url?: string | null
        }
        Update: {
          id?: string
          bio?: string | null
          specialties?: string[] | null
          instagram_url?: string | null
          website_url?: string | null
        }
        Relationships: [{ foreignKeyName: 'trainers_id_fkey'; columns: ['id']; referencedRelation: 'profiles'; referencedColumns: ['id'] }]
      }
      clients: {
        Row: {
          id: string
          trainer_id: string
          user_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          weight_kg: number | null
          height_cm: number | null
          goal: string | null
          notes: string | null
          status: 'active' | 'inactive' | 'paused'
          plan_type: string
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          user_id?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          goal?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'paused'
          plan_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          trainer_id?: string
          user_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          goal?: string | null
          notes?: string | null
          status?: 'active' | 'inactive' | 'paused'
          plan_type?: string
          created_at?: string
        }
        Relationships: [{ foreignKeyName: 'clients_trainer_id_fkey'; columns: ['trainer_id']; referencedRelation: 'trainers'; referencedColumns: ['id'] }]
      }
      exercises: {
        Row: {
          id: string
          created_by: string | null
          name: string
          muscle_group: string
          secondary_muscles: string[] | null
          description: string | null
          video_url: string | null
          image_url: string | null
          is_global: boolean
        }
        Insert: {
          id?: string
          created_by?: string | null
          name: string
          muscle_group: string
          secondary_muscles?: string[] | null
          description?: string | null
          video_url?: string | null
          image_url?: string | null
          is_global?: boolean
        }
        Update: {
          id?: string
          created_by?: string | null
          name?: string
          muscle_group?: string
          secondary_muscles?: string[] | null
          description?: string | null
          video_url?: string | null
          image_url?: string | null
          is_global?: boolean
        }
        Relationships: []
      }
      routines: {
        Row: {
          id: string
          trainer_id: string
          name: string
          description: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null
          duration_days: number | null
          is_template: boolean
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          name: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          duration_days?: number | null
          is_template?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          trainer_id?: string
          name?: string
          description?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced' | null
          duration_days?: number | null
          is_template?: boolean
          created_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          id: string
          routine_id: string
          exercise_id: string
          day_number: number
          sets: number
          reps: string
          rest_seconds: number
          weight_notes: string | null
          notes: string | null
          order_index: number
        }
        Insert: {
          id?: string
          routine_id: string
          exercise_id: string
          day_number: number
          sets: number
          reps: string
          rest_seconds?: number
          weight_notes?: string | null
          notes?: string | null
          order_index: number
        }
        Update: {
          id?: string
          routine_id?: string
          exercise_id?: string
          day_number?: number
          sets?: number
          reps?: string
          rest_seconds?: number
          weight_notes?: string | null
          notes?: string | null
          order_index?: number
        }
        Relationships: []
      }
      client_routines: {
        Row: {
          id: string
          client_id: string
          routine_id: string
          assigned_at: string
          start_date: string | null
          end_date: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          client_id: string
          routine_id: string
          assigned_at?: string
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          client_id?: string
          routine_id?: string
          assigned_at?: string
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          client_id: string
          client_routine_id: string | null
          day_number: number | null
          completed_at: string
          duration_minutes: number | null
          perceived_effort: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          client_routine_id?: string | null
          day_number?: number | null
          completed_at?: string
          duration_minutes?: number | null
          perceived_effort?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          client_routine_id?: string | null
          day_number?: number | null
          completed_at?: string
          duration_minutes?: number | null
          perceived_effort?: number | null
          notes?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          trainer_id: string
          client_id: string
          last_message_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          client_id: string
          last_message_at?: string
        }
        Update: {
          id?: string
          trainer_id?: string
          client_id?: string
          last_message_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string | null
          image_url: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content?: string | null
          image_url?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string | null
          image_url?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          id: string
          trainer_id: string
          client_id: string | null
          title: string
          description: string | null
          start_time: string
          end_time: string
          type: 'session' | 'reminder' | 'rest' | 'other'
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          client_id?: string | null
          title: string
          description?: string | null
          start_time: string
          end_time: string
          type?: 'session' | 'reminder' | 'rest' | 'other'
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trainer_id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          type?: 'session' | 'reminder' | 'rest' | 'other'
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          type: string
          read_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          type: string
          read_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          type?: string
          read_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      client_progress: {
        Row: {
          id: string
          client_id: string
          recorded_at: string
          weight_kg: number | null
          body_fat_pct: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          recorded_at?: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          recorded_at?: string
          weight_kg?: number | null
          body_fat_pct?: number | null
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
