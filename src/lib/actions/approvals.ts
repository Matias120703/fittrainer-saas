'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateClientStatus(profileId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'trainer') throw new Error('No autorizado')

  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', profileId)

  if (error) throw error

  revalidatePath('/clients')
  revalidatePath('/dashboard')
}
