'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const RoutineSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration_days: z.coerce.number().int().positive().optional().or(z.literal('')),
  is_template: z.coerce.boolean().default(false),
})

export type RoutineFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
  id?: string
}

export async function createRoutineAction(
  prevState: RoutineFormState,
  formData: FormData
): Promise<RoutineFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autorizado' }

  const raw = Object.fromEntries(formData)
  const parsed = RoutineSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { duration_days, ...rest } = parsed.data

  const { data, error } = await supabase.from('routines').insert({
    ...rest,
    trainer_id: user.id,
    duration_days: duration_days === '' ? null : Number(duration_days) || null,
  }).select('id').single()

  if (error) return { message: 'Error al crear: ' + error.message }

  revalidatePath('/routines')
  return { success: true, id: data.id }
}

export async function updateRoutineAction(
  id: string,
  prevState: RoutineFormState,
  formData: FormData
): Promise<RoutineFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autorizado' }

  const raw = Object.fromEntries(formData)
  const parsed = RoutineSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { duration_days, ...rest } = parsed.data

  const { error } = await supabase
    .from('routines')
    .update({
      ...rest,
      duration_days: duration_days === '' ? null : Number(duration_days) || null,
    })
    .eq('id', id)
    .eq('trainer_id', user.id)

  if (error) return { message: 'Error al actualizar: ' + error.message }

  revalidatePath('/routines')
  revalidatePath(`/routines/${id}`)
  return { success: true }
}

export async function deleteRoutineAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('routines').delete().eq('id', id).eq('trainer_id', user.id)
  revalidatePath('/routines')
  redirect('/routines')
}

const ExerciseEntrySchema = z.object({
  exercise_id: z.string().uuid(),
  day_number: z.coerce.number().int().positive(),
  sets: z.coerce.number().int().positive(),
  reps: z.string().min(1),
  rest_seconds: z.coerce.number().int().default(60),
  weight_notes: z.string().optional(),
  notes: z.string().optional(),
  order_index: z.coerce.number().int().default(0),
})

export async function saveRoutineExercisesAction(
  routineId: string,
  exercises: z.infer<typeof ExerciseEntrySchema>[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  // Verify ownership
  const { data: routine } = await supabase
    .from('routines')
    .select('id')
    .eq('id', routineId)
    .eq('trainer_id', user.id)
    .single()

  if (!routine) return { error: 'Rutina no encontrada' }

  // Replace all exercises for this routine
  await supabase.from('routine_exercises').delete().eq('routine_id', routineId)

  if (exercises.length > 0) {
    const { error } = await supabase.from('routine_exercises').insert(
      exercises.map((ex) => ({ ...ex, routine_id: routineId }))
    )
    if (error) return { error: error.message }
  }

  revalidatePath(`/routines/${routineId}`)
  return { success: true }
}
