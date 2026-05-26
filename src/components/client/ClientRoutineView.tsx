'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Loader2, Clock, Dumbbell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logWorkoutAction } from '@/lib/actions/workouts'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string; name: string; muscle_group: string; description: string | null
}

interface RoutineExercise {
  id: string; day_number: number; sets: number; reps: string
  rest_seconds: number; weight_notes: string | null; notes: string | null
  order_index: number; exercises: Exercise
}

interface RoutineData {
  id: string; name: string; description: string | null
  difficulty: string | null; duration_days: number | null
  routine_exercises: RoutineExercise[]
}

interface ClientRoutineViewProps {
  clientRoutineId: string
  routine: RoutineData
  completedToday: number[]
}

export function ClientRoutineView({ clientRoutineId, routine, completedToday }: ClientRoutineViewProps) {
  const maxDay = routine.duration_days ?? 7
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)
  const [activeDay, setActiveDay] = useState(1)
  const [completed, setCompleted] = useState<Set<number>>(new Set(completedToday))
  const [showLog, setShowLog] = useState(false)
  const [duration, setDuration] = useState('')
  const [effort, setEffort] = useState('')
  const [notes, setNotes] = useState('')
  const [logging, setLogging] = useState(false)
  const [expandedEx, setExpandedEx] = useState<string | null>(null)

  const dayExercises = routine.routine_exercises
    .filter((e) => e.day_number === activeDay)
    .sort((a, b) => a.order_index - b.order_index)

  const isCompleted = completed.has(activeDay)

  async function handleComplete() {
    setLogging(true)
    const result = await logWorkoutAction(
      clientRoutineId,
      activeDay,
      Number(duration) || 0,
      Number(effort) || 0,
      notes
    )
    if (result?.success) {
      setCompleted((prev) => new Set([...prev, activeDay]))
      setShowLog(false)
      setDuration('')
      setEffort('')
      setNotes('')
    }
    setLogging(false)
  }

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => {
          const count = routine.routine_exercises.filter((e) => e.day_number === day).length
          const done = completed.has(day)
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors relative',
                activeDay === day
                  ? 'bg-primary text-primary-foreground'
                  : done
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              Día {day}
              {done && <span className="ml-1">✓</span>}
              {!done && count > 0 && (
                <span className={`ml-1 text-xs ${activeDay === day ? 'opacity-70' : 'opacity-50'}`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Exercises */}
      {dayExercises.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center rounded-xl border border-border">
          <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No hay ejercicios para el Día {activeDay}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayExercises.map((ex, idx) => {
            const isExpanded = expandedEx === ex.id
            return (
              <div key={ex.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/30 transition-colors"
                  onClick={() => setExpandedEx(isExpanded ? null : ex.id)}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{ex.exercises.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.exercises.muscle_group}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-medium text-foreground">{ex.sets} × {ex.reps}</p>
                      {ex.weight_notes && <p className="text-xs text-muted-foreground">{ex.weight_notes}</p>}
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Series</p>
                        <p className="text-lg font-semibold text-foreground">{ex.sets}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Reps</p>
                        <p className="text-lg font-semibold text-foreground">{ex.reps}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Descanso</p>
                        <p className="text-lg font-semibold text-foreground">{ex.rest_seconds}s</p>
                      </div>
                    </div>
                    {ex.weight_notes && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Carga: </span>{ex.weight_notes}
                      </p>
                    )}
                    {ex.notes && (
                      <p className="text-sm text-muted-foreground">{ex.notes}</p>
                    )}
                    {ex.exercises.description && (
                      <p className="text-xs text-muted-foreground italic">{ex.exercises.description}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Complete workout button */}
      {dayExercises.length > 0 && (
        <div className="pt-2">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-400/10 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">¡Entrenamiento completado hoy!</span>
            </div>
          ) : showLog ? (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Registrar entrenamiento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Duración (min)</Label>
                  <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="45" className="bg-input border-border h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Esfuerzo (1-10)</Label>
                  <Input type="number" min="1" max="10" value={effort} onChange={(e) => setEffort(e.target.value)} placeholder="7" className="bg-input border-border h-9" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Notas (opcional)</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Cómo te fue?" className="bg-input border-border h-9" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowLog(false)} className="flex-1">Cancelar</Button>
                <Button size="sm" onClick={handleComplete} disabled={logging} className="flex-1 gap-2">
                  {logging ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Confirmar
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowLog(true)} className="w-full gap-2" size="lg">
              <CheckCircle2 className="h-5 w-5" />
              Marcar Día {activeDay} como completado
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
