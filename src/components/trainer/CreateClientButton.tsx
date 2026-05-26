'use client'

import { useState, useActionState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientAction, type ClientFormState } from '@/lib/actions/clients'

const initialState: ClientFormState = {}

export function CreateClientButton() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createClientAction, initialState)

  if (state.success && open) setOpen(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Nuevo cliente
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Nuevo cliente</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form action={action} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="full_name">Nombre completo *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Juan García"
                    className="bg-input border-border"
                    required
                  />
                  {state.errors?.full_name && (
                    <p className="text-xs text-destructive">{state.errors.full_name[0]}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="juan@email.com"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+54 9 11 1234-5678"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weight_kg">Peso (kg)</Label>
                  <Input
                    id="weight_kg"
                    name="weight_kg"
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="height_cm">Altura (cm)</Label>
                  <Input
                    id="height_cm"
                    name="height_cm"
                    type="number"
                    step="0.1"
                    placeholder="175"
                    className="bg-input border-border"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Input
                    id="goal"
                    name="goal"
                    placeholder="Perder grasa y ganar masa muscular"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="plan_type">Plan</Label>
                  <select
                    id="plan_type"
                    name="plan_type"
                    defaultValue="basic"
                    className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="basic">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status">Estado</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue="active"
                    className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="notes">Notas internas</Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="Lesiones, consideraciones especiales..."
                    className="flex w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {state.message && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.message}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
