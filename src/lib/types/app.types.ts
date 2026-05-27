import type { Database } from './database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Trainer = Database['public']['Tables']['trainers']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type Routine = Database['public']['Tables']['routines']['Row']
export type RoutineExercise = Database['public']['Tables']['routine_exercises']['Row']
export type ClientRoutine = Database['public']['Tables']['client_routines']['Row']
export type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type ClientProgress = Database['public']['Tables']['client_progress']['Row']

export type ClientWithProfile = Client & {
  profiles?: Profile | null
}

export type RoutineWithExercises = Routine & {
  routine_exercises: (RoutineExercise & {
    exercises: Exercise
  })[]
}

export type ConversationWithDetails = Conversation & {
  clients: Client
  last_message?: Message | null
  unread_count?: number
}

export type UserRole = 'trainer' | 'client'
export type ProfileStatus = 'pending' | 'approved' | 'rejected'

export type AuthUser = {
  id: string
  email: string
  role: UserRole
  full_name: string
  avatar_url: string | null
}
