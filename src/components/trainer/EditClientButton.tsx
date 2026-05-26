'use client'

import { useState, useActionState } from 'react'
import { Pencil, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClientAction, deleteClientAction, type ClientFormState } from '@/lib/actions/clients'
import type { Client } from '@/lib/types/app.types'

const initialState: ClientFormState = {}

export function EditClientButton({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  const boundUpdate = updateClientAction.bind(null, client.id)
  const [state, action, pending] = useActionState(boundUpdate, initialState)

  if (state.success && open) setOpen(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Pencil className="h-4 w-4" />
        Editar
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-card">
              <h2 className="text-base font-semibold text-foreground">Editar cliente</h2>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={action} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nombre completo *</Label>
                  <Input name="full_name" defaultValue={client.full_name} className="bg-input border-border" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input name="email" type="email" defaultValue={client.email ?? ''} className="bg-input border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input name="phone" defaultValue={client.phone ?? ''} className="bg-input border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Peso (kg)</Label>
                  <Input name="weight_kg" type="number" step="0.1" defaultValue={client.weight_kg?.toString() ?? ''} className="bg-input border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Altura (cm)</Label>
                  <Input name="height_cm" type="number" step="0.1" defaultValue={client.height_cm?.toString() ?? ''} className="bg-input border-border" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Objetivo</Label>
                  <Input name="goal" defaultValue={client.goal ?? ''} className="bg-input border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label>Plan</Label>
                  <select name="plan_type" defaultValue={client.plan_type} className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <select name="status" defaultValue={client.status} className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notas internas</Label>
                  <textarea name="notes" rows={2} defaultValue={client.notes ?? ''} className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                </div>
              </div>

              {state.message && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.message}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => deleteClientAction(client.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Eliminar cliente
                </button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" size="sm" disabled={pending}>
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
