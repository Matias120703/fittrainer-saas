'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'
import type { Routine } from '@/lib/types/app.types'
import { useRouter } from 'next/navigation'

interface AssignRoutineButtonProps {
  clientId: string
  trainerId: string
}

export function AssignRoutineButton({ clientId, trainerId }: AssignRoutineButtonProps) {
  const [open, setOpen] = useState(false)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('routines')
      .select('*')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRoutines(data ?? [])
        setLoading(false)
      })
  }, [open])

  async function handleAssign(routineId: string) {
    setAssigning(true)
    // Deactivate previous
    await supabase
      .from('client_routines')
      .update({ is_active: false })
      .eq('client_id', clientId)

    await supabase.from('client_routines').insert({
      client_id: clientId,
      routine_id: routineId,
      is_active: true,
    })

    setAssigning(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5 text-xs">
        <Plus className="h-3.5 w-3.5" />
        Asignar rutina
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-foreground">Asignar rutina</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : routines.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay rutinas creadas aún</p>
                </div>
              ) : (
                routines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={() => handleAssign(routine.id)}
                    disabled={assigning}
                    className="w-full flex items-start gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <div className="mt-0.5 rounded-md bg-violet-400/10 p-1.5">
                      <Dumbbell className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{routine.name}</p>
                      {routine.description && (
                        <p className="text-xs text-muted-foreground truncate">{routine.description}</p>
                      )}
                    </div>
                    {routine.is_template && (
                      <span className="shrink-0 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">Template</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
