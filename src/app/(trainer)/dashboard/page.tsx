import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Dumbbell, Calendar, MessageSquare, ArrowUpRight, TrendingUp } from 'lucide-react'
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
  const endOfDay   = new Date(today.setHours(23, 59, 59, 999)).toISOString()

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
    { title: 'Clientes totales', value: totalClients ?? 0, sub: `${activeClients ?? 0} activos`, icon: Users, accent: 'oklch(0.65 0.16 240)' },
    { title: 'Rutinas creadas', value: totalRoutines ?? 0, sub: 'plantillas y activas', icon: Dumbbell, accent: 'oklch(0.65 0.18 290)' },
    { title: 'Sesiones hoy', value: todayEvents?.length ?? 0, sub: 'en el calendario', icon: Calendar, accent: 'oklch(0.68 0.16 155)' },
    { title: 'Conversaciones', value: recentMessages?.length ?? 0, sub: 'activas esta semana', icon: MessageSquare, accent: 'oklch(0.72 0.14 82)' },
  ]

  const statusConfig = {
    active:   { label: 'Activo',   cls: 'border-emerald-500/30 text-emerald-400 bg-emerald-400/10' },
    paused:   { label: 'Pausado',  cls: 'border-amber-500/30 text-amber-400 bg-amber-400/10' },
    inactive: { label: 'Inactivo', cls: 'border-border text-muted-foreground' },
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl animate-page">

      {/* ── Header ── */}
      <div className="stagger-1 animate-page">
        <h1
          className="text-[32px] font-black italic uppercase leading-tight text-gold-gradient"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="animate-page rounded-2xl border border-white/[0.05] p-5 transition-all duration-300 hover:border-white/[0.09] group"
            style={{
              animationDelay: `${60 + i * 60}ms`,
              background: 'oklch(0.11 0.007 65 / 0.8)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${stat.accent}18` }}
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.accent }} />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/30" />
            </div>
            <p
              className="text-[42px] font-black leading-none"
              style={{ fontFamily: 'var(--font-heading)', color: stat.accent }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-[11px] font-semibold text-foreground/80 uppercase tracking-wide">{stat.title}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid gap-5 lg:grid-cols-2 stagger-3 animate-page">

        {/* Recent clients */}
        <div
          className="rounded-2xl border border-white/[0.05] overflow-hidden"
          style={{ background: 'oklch(0.11 0.007 65 / 0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
            <h2 className="text-sm font-semibold text-foreground">Clientes recientes</h2>
            <Link href="/clients" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
              Ver todos <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {recentClients?.length === 0 && (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">Aún no hay clientes.</p>
            )}
            {recentClients?.map((client) => {
              const initials = client.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              const sc = statusConfig[client.status as keyof typeof statusConfig]
              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-[10px] font-black" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88))', color: 'oklch(0.08 0.006 65)' }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{client.full_name}</p>
                    <p className="text-[11px] text-muted-foreground/60 truncate">{client.goal ?? 'Sin objetivo definido'}</p>
                  </div>
                  {sc && (
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${sc.cls}`}>
                      {sc.label}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Today's schedule */}
        <div
          className="rounded-2xl border border-white/[0.05] overflow-hidden"
          style={{ background: 'oklch(0.11 0.007 65 / 0.8)', backdropFilter: 'blur(12px)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
            <h2 className="text-sm font-semibold text-foreground">Agenda de hoy</h2>
            <Link href="/calendar" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
              Ver calendario <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {todayEvents?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No hay eventos hoy</p>
              </div>
            )}
            {todayEvents?.map((event) => (
              <div key={event.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex flex-col items-center text-center w-10 shrink-0">
                  <span className="text-[11px] font-bold text-primary">{format(new Date(event.start_time), 'HH:mm')}</span>
                  <span className="text-[9px] text-muted-foreground/50 mt-0.5">{format(new Date(event.end_time), 'HH:mm')}</span>
                </div>
                <div
                  className="w-px self-stretch rounded-full shrink-0"
                  style={{ background: 'oklch(0.72 0.14 82 / 0.4)' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{event.title}</p>
                  <p className="text-[11px] text-muted-foreground/60 capitalize">{
                    event.type === 'session' ? 'Sesión' : event.type === 'reminder' ? 'Recordatorio' : 'Descanso'
                  }</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="stagger-5 animate-page">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">Acciones rápidas</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Nuevo cliente',  href: '/clients?new=true' },
            { label: 'Crear rutina',   href: '/routines?new=true' },
            { label: 'Ver chat',       href: '/chat' },
            { label: 'Agregar evento', href: '/calendar?new=true' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.06]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
