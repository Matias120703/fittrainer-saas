'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function logWorkoutAction(
  clientRoutineId: string,
  dayNumber: number,
  durationMinutes: number,
  perceivedEffort: number,
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) return { error: 'Cliente no encontrado' }

  const { error } = await supabase.from('workout_logs').insert({
    client_id: clientRecord.id,
    client_routine_id: clientRoutineId,
    day_number: dayNumber,
    duration_minutes: durationMinutes || null,
    perceived_effort: perceivedEffort || null,
    notes: notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/routine')
  return { success: true }
}

export async function addProgressAction(
  weightKg: number,
  bodyFatPct: number,
  notes: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) return { error: 'Cliente no encontrado' }

  const { error } = await supabase.from('client_progress').insert({
    client_id: clientRecord.id,
    weight_kg: weightKg || null,
    body_fat_pct: bodyFatPct || null,
    notes: notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/progress')
  return { success: true }
}
