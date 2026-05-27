import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { CreateClientButton } from '@/components/trainer/CreateClientButton'
import { PendingRequests } from '@/components/trainer/PendingRequests'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { q, status } = await searchParams

  // Active clients from the clients table
  let query = supabase
    .from('clients')
    .select('id, full_name, email, phone, goal, status, plan_type, weight_kg, height_cm, created_at')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('full_name', `%${q}%`)
  if (status && status !== 'all') query = query.eq('status', status as 'active' | 'inactive' | 'paused')

  // Pending profile registrations (new users awaiting approval)
  const [{ data: clients }, { data: pendingProfiles }] = await Promise.all([
    query,
    supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .eq('role', 'client')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
  ])

  const statusCounts = {
    all: clients?.length ?? 0,
    active: clients?.filter((c) => c.status === 'active').length ?? 0,
    paused: clients?.filter((c) => c.status === 'paused').length ?? 0,
    inactive: clients?.filter((c) => c.status === 'inactive').length ?? 0,
  }

  const statusConfig = {
    active: { label: 'Activo', class: 'border-emerald-500/30 text-emerald-400 bg-emerald-400/10' },
    paused: { label: 'Pausado', class: 'border-amber-500/30 text-amber-400 bg-amber-400/10' },
    inactive: { label: 'Inactivo', class: 'border-border text-muted-foreground' },
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {statusCounts.all} clientes en total
            {(pendingProfiles?.length ?? 0) > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: 'oklch(0.72 0.14 82 / 0.15)', color: 'oklch(0.72 0.14 82)' }}>
                {pendingProfiles!.length} pendiente{pendingProfiles!.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <CreateClientButton />
      </div>

      {/* Pending requests */}
      <PendingRequests pending={pendingProfiles ?? []} />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Buscar cliente..."
            className="pl-9 bg-input border-border"
          />
        </form>
        <div className="flex items-center gap-1.5">
          {(['all', 'active', 'paused', 'inactive'] as const).map((s) => {
            const label = s === 'all' ? 'Todos' : statusConfig[s].label
            const count = statusCounts[s]
            const isActive = (!status && s === 'all') || status === s
            return (
              <Link
                key={s}
                href={s === 'all' ? '/clients' : `/clients?status=${s}`}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {label} <span className="ml-1 opacity-60">{count}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Table */}
      {clients?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No hay clientes aún</p>
          <p className="text-xs text-muted-foreground mt-1">
            {q ? 'No se encontraron resultados para tu búsqueda' : 'Crea tu primer cliente para empezar'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Objetivo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients?.map((client) => {
                const initials = client.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                const sc = statusConfig[client.status as keyof typeof statusConfig]
                return (
                  <tr key={client.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate hover:text-primary transition-colors">
                            {client.full_name}
                          </p>
                          {client.email && (
                            <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-muted-foreground truncate max-w-[200px]">
                        {client.goal ?? '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="capitalize text-foreground">{client.plan_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${sc?.class ?? ''}`}>
                        {sc?.label ?? client.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {client.phone ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
