import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ChatWindow } from '@/components/shared/ChatWindow'
import { markMessagesReadAction } from '@/lib/actions/messages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ conversationId: string }>
}

export default async function TrainerChatPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { conversationId } = await params

  type ConvRow = {
    id: string
    trainer_id: string
    client_id: string
    clients: { full_name: string; email: string | null } | null
  }

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, trainer_id, client_id, clients(full_name, email)')
    .eq('id', conversationId)
    .eq('trainer_id', user.id)
    .single() as unknown as { data: ConvRow | null }

  if (!conv) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, content, image_url, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  await markMessagesReadAction(conversationId)

  const client = conv.clients
  const initials = client?.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
        <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">{client?.full_name}</p>
          <p className="text-xs text-muted-foreground">Cliente</p>
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
