'use client'

import { useState, useActionState, useEffect } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRoutineAction, type RoutineFormState } from '@/lib/actions/routines'
import { useRouter } from 'next/navigation'

const initialState: RoutineFormState = {}

export function CreateRoutineButton() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createRoutineAction, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.success && state.id) {
      setOpen(false)
      router.push(`/routines/${state.id}`)
    }
  }, [state.success, state.id])

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Nueva rutina
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Nueva rutina</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={action} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input name="name" placeholder="Ej: Fuerza Upper/Lower 4 días" className="bg-input border-border" required />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <textarea name="description" rows={2} placeholder="Breve descripción de la rutina..." className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Dificultad</Label>
                  <select name="difficulty" className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Sin especificar</option>
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Días de duración</Label>
                  <Input name="duration_days" type="number" min="1" placeholder="28" className="bg-input border-border" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_template" name="is_template" value="true" className="h-4 w-4 rounded border-border" />
                <Label htmlFor="is_template" className="font-normal cursor-pointer">
                  Guardar como plantilla reutilizable
                </Label>
              </div>
              {state.message && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear y editar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
