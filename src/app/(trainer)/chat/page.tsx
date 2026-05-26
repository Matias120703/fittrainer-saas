import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare, Search } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { NewConversationButton } from '@/components/trainer/NewConversationButton'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      id,
      last_message_at,
      clients(id, full_name, email)
    `)
    .eq('trainer_id', user.id)
    .order('last_message_at', { ascending: false })

  type ConvRow = {
    id: string
    last_message_at: string
    clients: { id: string; full_name: string; email: string | null } | null
  }

  const convs = (conversations ?? []) as ConvRow[]

  // Get last message and unread count for each conversation
  const convIds = convs.map((c) => c.id)
  const { data: lastMessages } = convIds.length > 0
    ? await supabase
        .from('messages')
        .select('conversation_id, content, sender_id, created_at, read_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  type MsgRow = { conversation_id: string; content: string | null; sender_id: string; created_at: string; read_at: string | null }
  const lastMsgMap = new Map<string, MsgRow>()
  const unreadMap = new Map<string, number>()

  for (const msg of (lastMessages ?? []) as MsgRow[]) {
    if (!lastMsgMap.has(msg.conversation_id)) {
      lastMsgMap.set(msg.conversation_id, msg)
    }
    if (msg.sender_id !== user.id && !msg.read_at) {
      unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) ?? 0) + 1)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Chat</h1>
          <NewConversationButton trainerId={user.id} />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar conversación..." className="pl-9 bg-input border-border" />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {convs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">No hay conversaciones</p>
            <p className="text-xs text-muted-foreground mt-1">
              Inicia un chat con uno de tus clientes
            </p>
          </div>
        ) : (
          convs.map((conv) => {
            const client = conv.clients
            if (!client) return null
            const initials = client.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            const lastMsg = lastMsgMap.get(conv.id)
            const unread = unreadMap.get(conv.id) ?? 0

            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                className="flex items-center gap-3 px-5 py-4 border-b border-border hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${unread > 0 ? 'text-foreground' : 'text-foreground'}`}>
                      {client.full_name}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {conv.last_message_at
                        ? formatDistanceToNow(new Date(conv.last_message_at), { locale: es, addSuffix: true })
                        : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMsg?.content ?? 'Sin mensajes aún'}
                    </p>
                    {unread > 0 && (
                      <Badge className="h-5 min-w-5 rounded-full px-1.5 text-xs bg-primary text-primary-foreground shrink-0">
                        {unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
