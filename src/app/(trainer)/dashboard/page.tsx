import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Dumbbell, TrendingUp, MessageSquare, Calendar, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const [
    { count: totalClients },
    { count: activeClients },
    { count: totalRoutines },
    { data: recentClients },
    { data: todayEvents },
    { data: recentMessages },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('trainer_id', user.id),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('trainer_id', user.id).eq('status', 'active'),
    supabase.from('routines').select('*', { count: 'exact', head: true }).eq('trainer_id', user.id),
    supabase.from('clients').select('id, full_name, goal, status, created_at').eq('trainer_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('calendar_events').select('*').eq('trainer_id', user.id).gte('start_time', startOfDay).lte('end_time', endOfDay).order('start_time'),
    supabase.from('conversations').select('id, last_message_at, clients(full_name)').eq('trainer_id', user.id).order('last_message_at', { ascending: false }).limit(4),
  ])

  const stats = [
    {
      title: 'Clientes totales',
      value: totalClients ?? 0,
      sub: `${activeClients ?? 0} activos`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      title: 'Rutinas creadas',
      value: totalRoutines ?? 0,
      sub: 'plantillas y activas',
      icon: Dumbbell,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
    },
    {
      title: 'Sesiones hoy',
      value: todayEvents?.length ?? 0,
      sub: 'en el calendario',
      icon: Calendar,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      title: 'Conversaciones',
      value: recentMessages?.length ?? 0,
      sub: 'activas esta semana',
      icon: MessageSquare,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="mt-1 text-3xl font-semibold text-foreground">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent clients */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-medium text-foreground">Clientes recientes</CardTitle>
            <Link
              href="/clients"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClients?.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay clientes.</p>
            )}
            {recentClients?.map((client) => {
              const initials = client.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{client.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.goal ?? 'Sin objetivo definido'}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      client.status === 'active'
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-400/10'
                        : 'border-border text-muted-foreground'
                    }
                  >
                    {client.status === 'active' ? 'Activo' : client.status === 'paused' ? 'Pausado' : 'Inactivo'}
                  </Badge>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Today's schedule */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-sm font-medium text-foreground">Agenda de hoy</CardTitle>
            <Link
              href="/calendar"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver calendario <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents?.length === 0 && (
              <div className="flex flex-col items-center py-6 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No hay eventos hoy</p>
              </div>
            )}
            {todayEvents?.map((event) => (
              <div key={event.id} className="flex items-start gap-3 rounded-lg px-2 py-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.start_time), 'HH:mm')} — {format(new Date(event.end_time), 'HH:mm')}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground shrink-0">
                  {event.type === 'session' ? 'Sesión' : event.type === 'reminder' ? 'Recordatorio' : 'Descanso'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Nuevo cliente', href: '/clients?new=true' },
            { label: 'Crear rutina', href: '/routines?new=true' },
            { label: 'Ver chat', href: '/chat' },
            { label: 'Agregar evento', href: '/calendar?new=true' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
