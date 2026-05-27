'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const full_name = (formData.get('full_name') as string)?.trim()
  if (!full_name) return { error: 'El nombre no puede estar vacío.' }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function updateTrainerProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const bio           = (formData.get('bio') as string | null)?.trim() || null
  const instagram_url = (formData.get('instagram_url') as string | null)?.trim() || null
  const website_url   = (formData.get('website_url') as string | null)?.trim() || null
  const specialtiesRaw = (formData.get('specialties') as string | null)?.trim() || ''
  const specialties = specialtiesRaw
    ? specialtiesRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : null

  const { error } = await supabase
    .from('trainers')
    .upsert({ id: user.id, bio, instagram_url, website_url, specialties }, { onConflict: 'id' })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (!password || password.length < 6) return { error: 'Mínimo 6 caracteres.' }
  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}
