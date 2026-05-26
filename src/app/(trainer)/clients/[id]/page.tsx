import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Target, Dumbbell, TrendingUp, Calendar, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { format, differenceInYears } from 'date-fns'
import { es } from 'date-fns/locale'
import { EditClientButton } from '@/components/trainer/EditClientButton'
import { AssignRoutineButton } from '@/components/trainer/AssignRoutineButton'
import { ProgressSection } from '@/components/shared/ProgressSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('trainer_id', user.id)
    .single()

  if (!client) notFound()

  type ActiveRoutineRow = {
    id: string
    assigned_at: string
    is_active: boolean
    routines: { id: string; name: string; description: string | null; difficulty: string | null; duration_days: number | null } | null
  }

  const [
    { data: activeRoutineRaw },
    { data: workoutLogs },
    { data: progressRecords },
  ] = await Promise.all([
    supabase
      .from('client_routines')
      .select('id, assigned_at, is_active, routines(id, name, description, difficulty, duration_days)')
      .eq('client_id', id)
      .eq('is_active', true)
      .single() as unknown as Promise<{ data: ActiveRoutineRow | null }>,
    supabase
      .from('workout_logs')
      .select('id, completed_at, duration_minutes, perceived_effort')
      .eq('client_id', id)
      .order('completed_at', { ascending: false })
      .limit(100),
    supabase
      .from('client_progress')
      .select('id, recorded_at, weight_kg, body_fat_pct')
      .eq('client_id', id)
      .order('recorded_at', { ascending: true }),
  ])

  const initials = client.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const age = client.birth_date ? differenceInYears(new Date(), new Date(client.birth_date)) : null

  const statusConfig = {
    active: { label: 'Activo', class: 'border-emerald-500/30 text-emerald-400 bg-emerald-400/10' },
    paused: { label: 'Pausado', class: 'border-amber-500/30 text-amber-400 bg-amber-400/10' },
    inactive: { label: 'Inactivo', class: 'border-border text-muted-foreground' },
  }
  const sc = statusConfig[client.status as keyof typeof statusConfig]

  const activeRoutine = activeRoutineRaw
  const routine = activeRoutine?.routines ?? null

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      {/* Profile header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-foreground">{client.full_name}</h1>
              <Badge variant="outline" className={`text-xs ${sc.class}`}>{sc.label}</Badge>
            </div>
            {client.goal && (
              <p className="mt-1 text-sm text-muted-foreground">{client.goal}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Cliente desde {format(new Date(client.created_at), "MMMM yyyy", { locale: es })}
              {age ? ` · ${age} años` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EditClientButton client={client} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-5">
          {/* Stats */}
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">
                    {client.weight_kg ? `${client.weight_kg} kg` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Altura</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">
                    {client.height_cm ? `${client.height_cm} cm` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 capitalize">{client.plan_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sesiones</p>
                  <p className="text-xl font-semibold text-foreground mt-0.5">{workoutLogs?.length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email ? (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground truncate">{client.email}</span>
                </div>
              ) : null}
              {client.phone ? (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{client.phone}</span>
                </div>
              ) : null}
              {!client.email && !client.phone && (
                <p className="text-sm text-muted-foreground">Sin datos de contacto</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Notas internas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Active routine */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-violet-400" />
                Rutina activa
              </CardTitle>
              <AssignRoutineButton clientId={id} trainerId={user.id} />
            </CardHeader>
            <CardContent>
              {routine ? (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-foreground">{routine.name}</p>
                    {routine.description && (
                      <p className="text-sm text-muted-foreground mt-1">{routine.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {routine.difficulty && (
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground capitalize">
                          {routine.difficulty === 'beginner' ? 'Principiante' : routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                        </Badge>
                      )}
                      {routine.duration_days && (
                        <span className="text-xs text-muted-foreground">{routine.duration_days} días</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Asignada {format(new Date(activeRoutine!.assigned_at), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/routines/${routine.id}`}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Ver rutina
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Sin rutina asignada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent workouts */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Entrenamientos recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workoutLogs?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sin entrenamientos registrados</p>
              ) : (
                <div className="space-y-2">
                  {workoutLogs?.map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground">
                            {format(new Date(log.completed_at), "EEEE d 'de' MMMM", { locale: es })}
                          </p>
                          {log.duration_minutes && (
                            <p className="text-xs text-muted-foreground">{log.duration_minutes} min</p>
                          )}
                        </div>
                      </div>
                      {log.perceived_effort && (
                        <span className="text-xs text-muted-foreground">
                          Esfuerzo: {log.perceived_effort}/10
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Progreso del cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressSection
                records={progressRecords ?? []}
                workoutLogs={workoutLogs ?? []}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
