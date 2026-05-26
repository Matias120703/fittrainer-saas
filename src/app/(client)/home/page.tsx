import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, TrendingUp, MessageSquare, CheckCircle2, Calendar } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
    ? await supabase
        .from('workout_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientRecord.id)
    : { count: 0 }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Atleta'

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Hola, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground">Entrenamientos</p>
            </div>
            <p className="text-2xl font-semibold text-foreground">{completedWorkouts ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">completados</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-muted-foreground">Peso actual</p>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {clientRecord?.weight_kg ?? '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">kilogramos</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border col-span-2 sm:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-4 w-4 text-violet-400" />
              <p className="text-xs text-muted-foreground">Mi objetivo</p>
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {clientRecord?.goal ?? 'No definido aún'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current routine */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground">Rutina actual</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRoutine ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {activeRoutine.routines?.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {activeRoutine.routines?.description ?? 'Sin descripción'}
                  </p>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-400/10 shrink-0">
                  Activa
                </Badge>
              </div>
              <Link
                href="/routine"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Dumbbell className="h-4 w-4" />
                Ver rutina completa
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Tu entrenador aún no asignó una rutina</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Mi Rutina', href: '/routine', icon: Dumbbell, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          { label: 'Progreso', href: '/progress', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Chat', href: '/messages', icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Calendario', href: '/my-calendar', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent"
          >
            <div className={`rounded-lg p-2.5 ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <span className="text-xs font-medium text-foreground">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
