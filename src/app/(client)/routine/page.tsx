import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClientRoutineView } from '@/components/client/ClientRoutineView'

export default async function ClientRoutinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <Dumbbell className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Tu entrenador aún no te registró en el sistema</p>
      </div>
    )
  }

  type ClientRoutineRow = {
    id: string
    assigned_at: string
    routines: {
      id: string; name: string; description: string | null; difficulty: string | null; duration_days: number | null
      routine_exercises: Array<{
        id: string; day_number: number; sets: number; reps: string
        rest_seconds: number; weight_notes: string | null; notes: string | null; order_index: number
        exercises: { id: string; name: string; muscle_group: string; description: string | null }
      }>
    } | null
  }

  const { data: clientRoutine } = await supabase
    .from('client_routines')
    .select(`
      id,
      assigned_at,
      routines(
        id, name, description, difficulty, duration_days,
        routine_exercises(
          id, day_number, sets, reps, rest_seconds, weight_notes, notes, order_index,
          exercises(id, name, muscle_group, description)
        )
      )
    `)
    .eq('client_id', clientRecord.id)
    .eq('is_active', true)
    .single() as unknown as { data: ClientRoutineRow | null }

  if (!clientRoutine?.routines) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <Dumbbell className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-foreground">Sin rutina asignada</p>
        <p className="text-sm text-muted-foreground mt-1">Tu entrenador aún no asignó una rutina</p>
      </div>
    )
  }

  // Get today's completed workouts
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('workout_logs')
    .select('day_number')
    .eq('client_id', clientRecord.id)
    .eq('client_routine_id', clientRoutine.id)
    .gte('completed_at', `${today}T00:00:00`)

  const completedToday = new Set((todayLogs?.map((l) => l.day_number).filter((d): d is number => d !== null) ?? []))

  const routine = clientRoutine.routines!

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Rutina</h1>
        <p className="text-sm text-muted-foreground mt-1">Seguí tu plan de entrenamiento</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-foreground text-lg">{routine.name}</p>
              {routine.description && (
                <p className="text-sm text-muted-foreground mt-1">{routine.description}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {routine.difficulty && (
                <Badge variant="outline" className="text-xs border-border text-muted-foreground capitalize">
                  {routine.difficulty === 'beginner' ? 'Principiante' : routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </Badge>
              )}
              {routine.duration_days && (
                <span className="text-xs text-muted-foreground">{routine.duration_days} días</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientRoutineView
        clientRoutineId={clientRoutine.id}
        routine={routine}
        completedToday={Array.from(completedToday)}
      />
    </div>
  )
}
