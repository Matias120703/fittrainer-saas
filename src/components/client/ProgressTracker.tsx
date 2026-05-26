'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addProgressAction } from '@/lib/actions/workouts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ProgressSection, type ProgressRecord, type WorkoutLogItem } from '@/components/shared/ProgressSection'

interface ProgressTrackerProps {
  clientId: string
  records: ProgressRecord[]
  workoutLogs: WorkoutLogItem[]
  initialWeight: number | null
}

export function ProgressTracker({ records, workoutLogs }: ProgressTrackerProps) {
  const [showForm,     setShowForm]     = useState(false)
  const [weight,       setWeight]       = useState('')
  const [bodyFat,      setBodyFat]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [saving,       setSaving]       = useState(false)
  const [localRecords, setLocalRecords] = useState(records)

  async function handleAdd() {
    if (!weight && !bodyFat) return
    setSaving(true)
    const result = await addProgressAction(Number(weight), Number(bodyFat), notes)
    if (result?.success) {
      setLocalRecords((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          recorded_at: new Date().toISOString().split('T')[0],
          weight_kg: Number(weight) || null,
          body_fat_pct: Number(bodyFat) || null,
          notes: notes || null,
        },
      ])
      setShowForm(false)
      setWeight('')
      setBodyFat('')
      setNotes('')
    }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      {/* Chart + filter + training days */}
      <ProgressSection records={localRecords} workoutLogs={workoutLogs} />

      {/* Add record */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-foreground">Registros</h3>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Agregar medición
          </Button>
        </div>

        {showForm && (
          <div className="mb-4 rounded-lg border border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Peso (kg)</Label>
                <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75.5" className="bg-input border-border h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Grasa corporal (%)</Label>
                <Input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="18.5" className="bg-input border-border h-9" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Notas</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cómo te sentiste..." className="bg-input border-border h-9" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button size="sm" onClick={handleAdd} disabled={saving} className="flex-1 gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </div>
        )}

        {localRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin registros aún</p>
        ) : (
          <div className="space-y-2">
            {[...localRecords].reverse().map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(record.recorded_at), "d 'de' MMMM yyyy", { locale: es })}
                </span>
                <div className="flex items-center gap-4">
                  {record.weight_kg && <span className="text-sm font-medium text-foreground">{record.weight_kg} kg</span>}
                  {record.body_fat_pct && <span className="text-xs text-muted-foreground">{record.body_fat_pct}% grasa</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
