import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatWindow } from '@/components/shared/ChatWindow'
import { markMessagesReadAction } from '@/lib/actions/messages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare } from 'lucide-react'

export default async function ClientChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get client record
  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id, trainer_id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center px-6">
        <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-foreground">No estás vinculado a un entrenador</p>
        <p className="text-xs text-muted-foreground mt-1">
          Tu entrenador debe registrarte desde su panel
        </p>
      </div>
    )
  }

  // Get or create conversation
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id, trainer_id')
    .eq('trainer_id', clientRecord.trainer_id)
    .eq('client_id', clientRecord.id)
    .single()

  let conversationId = existingConv?.id

  if (!conversationId) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ trainer_id: clientRecord.trainer_id, client_id: clientRecord.id })
      .select('id')
      .single()
    conversationId = newConv?.id
  }

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Error al cargar el chat</p>
      </div>
    )
  }

  // Get trainer profile
  const { data: trainerProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', clientRecord.trainer_id)
    .single()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, content, image_url, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  await markMessagesReadAction(conversationId)

  const initials = trainerProfile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'TR'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{trainerProfile?.full_name ?? 'Tu entrenador'}</p>
          <p className="text-xs text-muted-foreground">Entrenador personal</p>
        </div>
      </div>

      <ChatWindow
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  )
}
