'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendMessageAction(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !content.trim()) return { error: 'Inválido' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath(`/chat/${conversationId}`)
  return { success: true }
}

export async function getOrCreateConversation(clientId: string, trainerId: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('trainer_id', trainerId)
    .eq('client_id', clientId)
    .single()

  if (existing) return existing.id

  const { data: created } = await supabase
    .from('conversations')
    .insert({ trainer_id: trainerId, client_id: clientId })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function markMessagesReadAction(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)
}
