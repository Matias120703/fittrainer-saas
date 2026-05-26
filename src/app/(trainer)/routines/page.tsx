import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Dumbbell, Plus, LayoutTemplate, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreateRoutineButton } from '@/components/trainer/CreateRoutineButton'

export default async function RoutinesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: routines } = await supabase
    .from('routines')
    .select('id, name, description, difficulty, duration_days, is_template, created_at')
    .eq('trainer_id', user.id)
    .order('created_at', { ascending: false })

  const regular = routines?.filter((r) => !r.is_template) ?? []
  const templates = routines?.filter((r) => r.is_template) ?? []

  const difficultyConfig = {
    beginner: { label: 'Principiante', class: 'border-emerald-500/30 text-emerald-400 bg-emerald-400/10' },
    intermediate: { label: 'Intermedio', class: 'border-amber-500/30 text-amber-400 bg-amber-400/10' },
    advanced: { label: 'Avanzado', class: 'border-red-500/30 text-red-400 bg-red-400/10' },
  }

  const RoutineCard = ({ routine }: { routine: typeof regular[0] }) => {
    const diff = routine.difficulty ? difficultyConfig[routine.difficulty as keyof typeof difficultyConfig] : null
    return (
      <Link href={`/routines/${routine.id}`}>
        <Card className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer h-full">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="rounded-lg bg-violet-400/10 p-2">
                {routine.is_template ? (
                  <LayoutTemplate className="h-4 w-4 text-violet-400" />
                ) : (
                  <Dumbbell className="h-4 w-4 text-violet-400" />
                )}
              </div>
              {diff && (
                <Badge variant="outline" className={`text-xs ${diff.class}`}>{diff.label}</Badge>
              )}
            </div>
            <p className="font-medium text-foreground leading-tight">{routine.name}</p>
            {routine.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{routine.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              {routine.duration_days && (
                <span className="text-xs text-muted-foreground">{routine.duration_days} días</span>
              )}
              <span className="text-xs text-muted-foreground">
                {format(new Date(routine.created_at), "d MMM yyyy", { locale: es })}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Rutinas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {regular.length} rutinas · {templates.length} plantillas
          </p>
        </div>
        <CreateRoutineButton />
      </div>

      {/* Regular routines */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          Mis rutinas
        </h2>
        {regular.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No hay rutinas creadas</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regular.map((r) => <RoutineCard key={r.id} routine={r} />)}
          </div>
        )}
      </section>

      {/* Templates */}
      {templates.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Plantillas reutilizables
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((r) => <RoutineCard key={r.id} routine={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}
