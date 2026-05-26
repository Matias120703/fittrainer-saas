'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const ClientSchema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  weight_kg: z.coerce.number().positive().optional().or(z.literal('')),
  height_cm: z.coerce.number().positive().optional().or(z.literal('')),
  goal: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'paused']).default('active'),
  plan_type: z.string().default('basic'),
})

export type ClientFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function createClientAction(
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autorizado' }

  const raw = Object.fromEntries(formData)
  const parsed = ClientSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { weight_kg, height_cm, email, ...rest } = parsed.data

  const { error } = await supabase.from('clients').insert({
    ...rest,
    trainer_id: user.id,
    email: email || null,
    weight_kg: weight_kg === '' ? null : Number(weight_kg) || null,
    height_cm: height_cm === '' ? null : Number(height_cm) || null,
  })

  if (error) return { message: 'Error al crear cliente: ' + error.message }

  revalidatePath('/clients')
  return { success: true }
}

export async function updateClientAction(
  id: string,
  prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'No autorizado' }

  const raw = Object.fromEntries(formData)
  const parsed = ClientSchema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { weight_kg, height_cm, email, ...rest } = parsed.data

  const { error } = await supabase
    .from('clients')
    .update({
      ...rest,
      email: email || null,
      weight_kg: weight_kg === '' ? null : Number(weight_kg) || null,
      height_cm: height_cm === '' ? null : Number(height_cm) || null,
    })
    .eq('id', id)
    .eq('trainer_id', user.id)

  if (error) return { message: 'Error al actualizar: ' + error.message }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { success: true }
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('clients').delete().eq('id', id).eq('trainer_id', user.id)
  revalidatePath('/clients')
  redirect('/clients')
}
