'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, GripVertical, Loader2, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { saveRoutineExercisesAction } from '@/lib/actions/routines'
import type { Exercise } from '@/lib/types/app.types'

interface RoutineExerciseEntry {
  id?: string
  exercise_id: string
  exercise_name: string
  exercise_muscle: string
  day_number: number
  sets: number
  reps: string
  rest_seconds: number
  weight_notes: string
  notes: string
  order_index: number
}

interface RoutineBuilderProps {
  routine: {
    id: string
    name: string
    description: string | null
    difficulty: string | null
    duration_days: number | null
    is_template: boolean
    routine_exercises: Array<{
      id: string
      exercise_id: string
      day_number: number
      sets: number
      reps: string
      rest_seconds: number
      weight_notes: string | null
      notes: string | null
      order_index: number
      exercises: Exercise
    }>
  }
  exercises: Exercise[]
}

const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 'Piernas', 'Glúteos', 'Abdomen', 'Cardio']

export function RoutineBuilder({ routine, exercises }: RoutineBuilderProps) {
  const [entries, setEntries] = useState<RoutineExerciseEntry[]>(
    routine.routine_exercises
      .sort((a, b) => a.day_number - b.order_index)
      .map((re) => ({
        id: re.id,
        exercise_id: re.exercise_id,
        exercise_name: re.exercises.name,
        exercise_muscle: re.exercises.muscle_group,
        day_number: re.day_number,
        sets: re.sets,
        reps: re.reps,
        rest_seconds: re.rest_seconds,
        weight_notes: re.weight_notes ?? '',
        notes: re.notes ?? '',
        order_index: re.order_index,
      }))
  )

  const [activeDay, setActiveDay] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [searchEx, setSearchEx] = useState('')
  const [filterMuscle, setFilterMuscle] = useState('Todos')

  const maxDay = routine.duration_days ?? 7
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)

  const dayEntries = entries.filter((e) => e.day_number === activeDay)
    .sort((a, b) => a.order_index - b.order_index)

  function addExercise(exercise: Exercise) {
    const dayExercises = entries.filter((e) => e.day_number === activeDay)
    setEntries((prev) => [
      ...prev,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        exercise_muscle: exercise.muscle_group,
        day_number: activeDay,
        sets: 3,
        reps: '8-12',
        rest_seconds: 60,
        weight_notes: '',
        notes: '',
        order_index: dayExercises.length,
      },
    ])
    setShowExercisePicker(false)
  }

  function updateEntry(idx: number, field: keyof RoutineExerciseEntry, value: string | number) {
    setEntries((prev) => {
      const all = [...prev]
      const dayIdxs = all.reduce<number[]>((acc, e, i) => {
        if (e.day_number === activeDay) acc.push(i)
        return acc
      }, [])
      const realIdx = dayIdxs[idx]
      if (realIdx !== undefined) {
        all[realIdx] = { ...all[realIdx], [field]: value }
      }
      return all
    })
  }

  function removeEntry(idx: number) {
    setEntries((prev) => {
      const all = [...prev]
      const dayIdxs = all.reduce<number[]>((acc, e, i) => {
        if (e.day_number === activeDay) acc.push(i)
        return acc
      }, [])
      const realIdx = dayIdxs[idx]
      if (realIdx !== undefined) all.splice(realIdx, 1)
      return all
    })
  }

  async function handleSave() {
    setSaving(true)
    const result = await saveRoutineExercisesAction(
      routine.id,
      entries.map(({ id: _id, exercise_name: _n, exercise_muscle: _m, ...e }) => e)
    )
    setSaving(false)
    if (result?.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const filteredExercises = exercises.filter((ex) => {
    const matchSearch = ex.name.toLowerCase().includes(searchEx.toLowerCase())
    const matchMuscle = filterMuscle === 'Todos' || ex.muscle_group.toLowerCase().includes(filterMuscle.toLowerCase())
    return matchSearch && matchMuscle
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{routine.name}</h1>
          {routine.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{routine.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {routine.difficulty && (
              <Badge variant="outline" className="text-xs border-border text-muted-foreground capitalize">
                {routine.difficulty === 'beginner' ? 'Principiante' : routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </Badge>
            )}
            {routine.duration_days && (
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {routine.duration_days} días
              </Badge>
            )}
            {routine.is_template && (
              <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400 bg-violet-400/10">
                Plantilla
              </Badge>
            )}
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shrink-0">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? 'Guardado ✓' : 'Guardar'}
        </Button>
      </div>

      {/* Day tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {days.map((day) => {
          const count = entries.filter((e) => e.day_number === day).length
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeDay === day
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              Día {day}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${activeDay === day ? 'opacity-70' : 'opacity-50'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Day content */}
      <div className="space-y-3">
        {dayEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">No hay ejercicios en el Día {activeDay}</p>
            <p className="text-xs text-muted-foreground mt-1">Usa el botón para agregar</p>
          </div>
        )}

        {dayEntries.map((entry, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-muted-foreground/40 cursor-grab">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{entry.exercise_name}</p>
                    <p className="text-xs text-muted-foreground">{entry.exercise_muscle}</p>
                  </div>
                  <button
                    onClick={() => removeEntry(idx)}
                    className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Series</Label>
                    <Input
                      type="number"
                      min="1"
                      value={entry.sets}
                      onChange={(e) => updateEntry(idx, 'sets', Number(e.target.value))}
                      className="h-8 bg-input border-border text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Reps</Label>
                    <Input
                      value={entry.reps}
                      onChange={(e) => updateEntry(idx, 'reps', e.target.value)}
                      placeholder="8-12"
                      className="h-8 bg-input border-border text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Descanso (seg)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={entry.rest_seconds}
                      onChange={(e) => updateEntry(idx, 'rest_seconds', Number(e.target.value))}
                      className="h-8 bg-input border-border text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Carga/notas</Label>
                    <Input
                      value={entry.weight_notes}
                      onChange={(e) => updateEntry(idx, 'weight_notes', e.target.value)}
                      placeholder="Ej: 60kg"
                      className="h-8 bg-input border-border text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Notas del ejercicio</Label>
                  <Input
                    value={entry.notes}
                    onChange={(e) => updateEntry(idx, 'notes', e.target.value)}
                    placeholder="Instrucciones adicionales..."
                    className="h-8 bg-input border-border text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={() => setShowExercisePicker(true)}
          className="w-full gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" />
          Agregar ejercicio al Día {activeDay}
        </Button>
      </div>

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExercisePicker(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
              <h2 className="text-base font-semibold text-foreground">Agregar ejercicio</h2>
              <button onClick={() => setShowExercisePicker(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchEx}
                  onChange={(e) => setSearchEx(e.target.value)}
                  placeholder="Buscar ejercicio..."
                  className="pl-9 bg-input border-border"
                  autoFocus
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {muscleGroups.map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMuscle(m)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      filterMuscle === m
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-1.5">
              {filteredExercises.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No se encontraron ejercicios</p>
                  <p className="text-xs text-muted-foreground mt-1">Prueba con otra búsqueda</p>
                </div>
              ) : (
                filteredExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">{ex.muscle_group}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
