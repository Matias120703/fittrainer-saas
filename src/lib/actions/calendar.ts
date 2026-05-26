'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const EventSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  start_time: z.string().min(1, 'Fecha requerida'),
  end_time: z.string().min(1, 'Fecha fin requerida'),
  type: z.enum(['session', 'reminder', 'rest', 'other']).default('session'),
  client_id: z.string().optional(),
})

export type EventFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function createEventAction(
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autorizado' }

  const raw = Object.fromEntries(formData)
  const parsed = EventSchema.safeParse(raw)
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const { client_id, ...rest } = parsed.data

  const { error } = await supabase.from('calendar_events').insert({
    ...rest,
    trainer_id: user.id,
    client_id: client_id || null,
  })

  if (error) return { message: 'Error al crear: ' + error.message }

  revalidatePath('/calendar')
  return { success: true }
}

export async function deleteEventAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('calendar_events').delete().eq('id', id).eq('trainer_id', user.id)
  revalidatePath('/calendar')
}
