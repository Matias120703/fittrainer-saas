'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { sendMessageAction } from '@/lib/actions/messages'
import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  content: string | null
  image_url: string | null
  read_at: string | null
  created_at: string
}

interface ChatWindowProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
}

function formatMsgDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return `Ayer ${format(d, 'HH:mm')}`
  return format(d, "d MMM HH:mm", { locale: es })
}

function getDayLabel(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export function ChatWindow({ conversationId, currentUserId, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || sending) return

    const content = input.trim()
    setInput('')
    setSending(true)

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      content,
      image_url: null,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    await sendMessageAction(conversationId, content)
    setSending(false)
  }

  // Group messages by day
  const grouped: { day: string; msgs: Message[] }[] = []
  for (const msg of messages) {
    const day = format(new Date(msg.created_at), 'yyyy-MM-dd')
    const last = grouped[grouped.length - 1]
    if (last?.day === day) {
      last.msgs.push(msg)
    } else {
      grouped.push({ day, msgs: [msg] })
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">No hay mensajes aún</p>
            <p className="text-xs text-muted-foreground mt-1">Enviá el primero 👋</p>
          </div>
        )}

        {grouped.map(({ day, msgs }) => (
          <div key={day} className="space-y-2">
            {/* Day separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground capitalize">
                {getDayLabel(msgs[0].created_at)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {msgs.map((msg, idx) => {
              const isOwn = msg.sender_id === currentUserId
              const isTemp = msg.id.startsWith('temp-')
              const showTime = idx === msgs.length - 1 ||
                new Date(msgs[idx + 1]?.created_at).getTime() - new Date(msg.created_at).getTime() > 5 * 60 * 1000

              return (
                <div
                  key={msg.id}
                  className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn('max-w-[70%] space-y-0.5', isOwn ? 'items-end' : 'items-start', 'flex flex-col')}>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-secondary text-foreground rounded-bl-sm',
                        isTemp && 'opacity-70'
                      )}
                    >
                      {msg.content}
                    </div>
                    {showTime && (
                      <span className="text-xs text-muted-foreground px-1">
                        {formatMsgDate(msg.created_at)}
                        {isOwn && !isTemp && msg.read_at && (
                          <span className="ml-1 text-primary">✓✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-border px-5 py-4 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="flex-1 rounded-xl bg-input border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as React.FormEvent)
            }
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}
