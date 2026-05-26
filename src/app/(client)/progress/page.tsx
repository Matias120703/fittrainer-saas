import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressTracker } from '@/components/client/ProgressTracker'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id, weight_kg, height_cm, goal')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Tu entrenador aún no te registró en el sistema</p>
      </div>
    )
  }

  const [{ data: progressRecords }, { data: workoutLogs }] = await Promise.all([
    supabase
      .from('client_progress')
      .select('id, recorded_at, weight_kg, body_fat_pct, notes')
      .eq('client_id', clientRecord.id)
      .order('recorded_at', { ascending: true }),
    supabase
      .from('workout_logs')
      .select('id, completed_at, duration_minutes')
      .eq('client_id', clientRecord.id)
      .order('completed_at', { ascending: false }),
  ])

  const records = progressRecords ?? []
  const logs = workoutLogs ?? []
  const lastRecord = records[records.length - 1]
  const firstRecord = records[0]
  const weightChange = lastRecord?.weight_kg && firstRecord?.weight_kg
    ? (lastRecord.weight_kg - firstRecord.weight_kg).toFixed(1)
    : null

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Progreso</h1>
        <p className="text-sm text-muted-foreground mt-1">Seguí tu evolución a lo largo del tiempo</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">
              {lastRecord?.weight_kg ?? clientRecord.weight_kg ?? '—'}
              <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Peso actual</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className={`text-2xl font-semibold ${weightChange && Number(weightChange) < 0 ? 'text-emerald-400' : weightChange && Number(weightChange) > 0 ? 'text-amber-400' : 'text-foreground'}`}>
              {weightChange ? (Number(weightChange) > 0 ? `+${weightChange}` : weightChange) : '—'}
              {weightChange && <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Cambio total</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold text-foreground">{logs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Entrenamientos</p>
          </CardContent>
        </Card>
      </div>

      <ProgressTracker
        clientId={clientRecord.id}
        records={records}
        workoutLogs={logs}
        initialWeight={clientRecord.weight_kg}
      />
    </div>
  )
}
