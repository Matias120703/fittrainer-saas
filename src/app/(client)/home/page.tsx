import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, TrendingUp, MessageSquare, CheckCircle2, Calendar, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const quickLinks = [
  { label: 'Mi Rutina',   href: '/routine',     icon: Dumbbell,      accent: 'oklch(0.65 0.18 290)' },
  { label: 'Progreso',    href: '/progress',    icon: TrendingUp,    accent: 'oklch(0.65 0.16 240)' },
  { label: 'Chat',        href: '/messages',    icon: MessageSquare, accent: 'oklch(0.72 0.14 82)' },
  { label: 'Calendario',  href: '/my-calendar', icon: Calendar,      accent: 'oklch(0.68 0.16 155)' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function ClientHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id, goal, weight_kg, height_cm')
    .eq('user_id', user.id)
    .single()

  type ActiveRoutineData = {
    id: string
    routine_id: string
    routines: { name: string; description: string | null; duration_days: number | null } | null
  }

  let activeRoutine: ActiveRoutineData | null = null
  if (clientRecord) {
    const { data } = await supabase
      .from('client_routines')
      .select('id, routine_id, routines(name, description, duration_days)')
      .eq('client_id', clientRecord.id)
      .eq('is_active', true)
      .single()
    activeRoutine = data as ActiveRoutineData | null
  }

  const { count: completedWorkouts } = clientRecord
    ? await supabase.from('workout_logs').select('*', { count: 'exact', head: true }).eq('client_id', clientRecord.id)
    : { count: 0 }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Atleta'

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-2xl animate-page">

      {/* ── Greeting ── */}
      <div className="stagger-1 animate-page">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/60 mb-1">
          {getGreeting()}
        </p>
        <h1
          className="text-[36px] font-black italic uppercase leading-tight text-gold-gradient"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3 stagger-2 animate-page">
        {[
          { icon: CheckCircle2, label: 'Entrenamientos', value: completedWorkouts ?? 0, unit: 'completados', accent: 'oklch(0.68 0.16 155)' },
          { icon: TrendingUp,   label: 'Peso actual',    value: clientRecord?.weight_kg ?? '—', unit: 'kg', accent: 'oklch(0.65 0.16 240)' },
          { icon: Zap,          label: 'Objetivo',       value: clientRecord?.goal ? '✓' : '—', unit: 'definido', accent: 'oklch(0.72 0.14 82)' },
        ].map(({ icon: Icon, label, value, unit, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.05] p-4 flex flex-col gap-2"
            style={{ background: 'oklch(0.11 0.007 65 / 0.8)', backdropFilter: 'blur(12px)' }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${accent}18` }}>
              <Icon className="h-4 w-4" style={{ color: accent }} />
            </div>
            <div>
              <p className="text-[28px] font-black leading-none" style={{ fontFamily: 'var(--font-heading)', color: accent }}>{value}</p>
              <p className="text-[9px] text-muted-foreground/55 uppercase tracking-wide mt-1">{unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active routine ── */}
      <div
        className="rounded-2xl border overflow-hidden stagger-3 animate-page"
        style={{
          background: activeRoutine
            ? 'linear-gradient(135deg, oklch(0.11 0.007 65 / 0.9) 0%, oklch(0.13 0.010 80 / 0.5) 100%)'
            : 'oklch(0.11 0.007 65 / 0.8)',
          borderColor: activeRoutine ? 'oklch(0.72 0.14 82 / 0.2)' : 'oklch(0.94 0.006 75 / 0.05)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" style={{ filter: 'drop-shadow(0 0 5px oklch(0.72 0.14 82 / 0.6))' }} />
            <h2 className="text-sm font-semibold text-foreground">Rutina actual</h2>
          </div>
          {activeRoutine && (
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-400/10 text-[10px]">
              Activa
            </Badge>
          )}
        </div>

        <div className="p-5">
          {activeRoutine ? (
            <div className="space-y-4">
              <div>
                <p className="text-[18px] font-bold text-foreground">{activeRoutine.routines?.name}</p>
                {activeRoutine.routines?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{activeRoutine.routines.description}</p>
                )}
                {activeRoutine.routines?.duration_days && (
                  <p className="text-[11px] text-muted-foreground/50 mt-1">{activeRoutine.routines.duration_days} días de duración</p>
                )}
              </div>
              <Link
                href="/routine"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold uppercase tracking-wider transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.52 0.11 70) 0%, oklch(0.80 0.14 88) 50%, oklch(0.52 0.11 70) 100%)',
                  color: 'oklch(0.08 0.006 65)',
                  boxShadow: '0 0 20px oklch(0.72 0.14 82 / 0.2)',
                }}
              >
                Ver rutina completa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'oklch(0.72 0.14 82 / 0.08)' }}>
                <Dumbbell className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground/70">Sin rutina asignada</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Tu entrenador te asignará una pronto</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick nav ── */}
      <div className="stagger-4 animate-page">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">Acceso rápido</p>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ label, href, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] p-4 transition-all duration-200 hover:border-white/[0.09]"
              style={{ background: 'oklch(0.11 0.007 65 / 0.8)', backdropFilter: 'blur(12px)' }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${accent}18` }}
              >
                <Icon className="h-4 w-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{label}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 ml-auto shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
