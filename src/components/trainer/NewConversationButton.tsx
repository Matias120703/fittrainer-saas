'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createBrowserClient } from '@/lib/supabase/client'
import { getOrCreateConversation } from '@/lib/actions/messages'
import { useRouter } from 'next/navigation'
import type { Client } from '@/lib/types/app.types'

export function NewConversationButton({ trainerId }: { trainerId: string }) {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('clients')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('status', 'active')
      .order('full_name')
      .then(({ data }) => {
        setClients(data ?? [])
        setLoading(false)
      })
  }, [open])

  const filtered = clients.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleStart(clientId: string) {
    setStarting(clientId)
    const convId = await getOrCreateConversation(clientId, trainerId)
    if (convId) {
      setOpen(false)
      router.push(`/chat/${convId}`)
    }
    setStarting(null)
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Nuevo chat
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold">Iniciar conversación</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="pl-9 bg-input border-border"
                  autoFocus
                />
              </div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : filtered.map((client) => {
                  const initials = client.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <button
                      key={client.id}
                      onClick={() => handleStart(client.id)}
                      disabled={!!starting}
                      className="w-full flex items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{client.full_name}</span>
                      {starting === client.id && <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
