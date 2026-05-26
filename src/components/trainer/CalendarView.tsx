'use client'

import { useState, useActionState, useEffect } from 'react'
import {
  ChevronLeft, ChevronRight, Plus, X, Loader2, Trash2, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createEventAction, deleteEventAction, type EventFormState } from '@/lib/actions/calendar'
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  addWeeks, subWeeks, isToday, isSameDay, parseISO
} from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  type: string
  client_id: string | null
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[]
  clients: { id: string; full_name: string }[]
  trainerId: string
}

const typeConfig = {
  session: { label: 'Sesión', color: 'bg-primary/20 text-primary border-primary/30' },
  reminder: { label: 'Recordatorio', color: 'bg-amber-400/20 text-amber-400 border-amber-400/30' },
  rest: { label: 'Descanso', color: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' },
  other: { label: 'Otro', color: 'bg-muted text-muted-foreground border-border' },
}

const initialState: EventFormState = {}

export function CalendarView({ initialEvents, clients, trainerId }: CalendarViewProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [events, setEvents] = useState(initialEvents)
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [state, action, pending] = useActionState(createEventAction, initialState)

  useEffect(() => {
    if (state.success) {
      setShowModal(false)
      // Reload page to get updated events
      window.location.reload()
    }
  }, [state.success])

  const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) })
  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7am - 20pm

  function eventsForDay(day: Date) {
    return events.filter((e) => isSameDay(parseISO(e.start_time), day))
  }

  async function handleDeleteEvent(id: string) {
    await deleteEventAction(id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setSelectedEvent(null)
  }

  const defaultDate = selectedDay
    ? format(selectedDay, "yyyy-MM-dd'T'HH:mm")
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const defaultEnd = selectedDay
    ? format(new Date(selectedDay.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
    : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(weekStart, "MMMM yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => subWeeks(w, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => setWeekStart((w) => addWeeks(w, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Button
            size="sm"
            onClick={() => { setSelectedDay(new Date()); setShowModal(true) }}
            className="gap-2 ml-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo evento
          </Button>
        </div>
      </div>

      {/* Week grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
          <div className="py-3 px-2" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="py-3 px-2 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => { setSelectedDay(day); setShowModal(true) }}
            >
              <p className="text-xs text-muted-foreground capitalize">
                {format(day, 'EEE', { locale: es })}
              </p>
              <p className={cn(
                'text-sm font-medium mt-0.5 mx-auto w-7 h-7 flex items-center justify-center rounded-full',
                isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}>
                {format(day, 'd')}
              </p>
              {eventsForDay(day).length > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {eventsForDay(day).slice(0, 3).map((_, i) => (
                    <div key={i} className="h-1 w-1 rounded-full bg-primary" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="grid grid-cols-8">
          <div className="border-r border-border">
            {hours.map((h) => (
              <div key={h} className="h-14 border-b border-border px-2 flex items-start pt-1">
                <span className="text-xs text-muted-foreground">{h}:00</span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayEvents = eventsForDay(day)
            return (
              <div key={day.toISOString()} className="border-r border-border relative">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-14 border-b border-border hover:bg-accent/20 transition-colors cursor-pointer"
                    onClick={() => {
                      const d = new Date(day)
                      d.setHours(h, 0, 0, 0)
                      setSelectedDay(d)
                      setShowModal(true)
                    }}
                  />
                ))}
                {/* Event chips */}
                {dayEvents.map((event) => {
                  const startH = new Date(event.start_time).getHours()
                  const startM = new Date(event.start_time).getMinutes()
                  const top = ((startH - 7) * 56) + (startM / 60 * 56)
                  const durationMs = new Date(event.end_time).getTime() - new Date(event.start_time).getTime()
                  const height = Math.max((durationMs / 3600000) * 56, 20)
                  const tc = typeConfig[event.type as keyof typeof typeConfig] ?? typeConfig.other

                  return (
                    <button
                      key={event.id}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded-md border px-1.5 py-0.5 text-left overflow-hidden',
                        tc.color
                      )}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(event) }}
                    >
                      <p className="text-xs font-medium truncate leading-tight">{event.title}</p>
                      <p className="text-xs opacity-70 leading-tight">
                        {format(parseISO(event.start_time), 'HH:mm')}
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Create event modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold">Nuevo evento</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={action} className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input name="title" placeholder="Ej: Sesión con Juan" className="bg-input border-border" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Inicio</Label>
                  <Input name="start_time" type="datetime-local" defaultValue={defaultDate} className="bg-input border-border" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Fin</Label>
                  <Input name="end_time" type="datetime-local" defaultValue={defaultEnd} className="bg-input border-border" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <select name="type" defaultValue="session" className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="session">Sesión</option>
                    <option value="reminder">Recordatorio</option>
                    <option value="rest">Descanso</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Cliente (opcional)</Label>
                  <select name="client_id" className="flex h-9 w-full rounded-md border border-border bg-input px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Sin cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Input name="description" placeholder="Opcional..." className="bg-input border-border" />
              </div>
              {state.message && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear evento
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="outline" className={`text-xs mb-2 ${typeConfig[selectedEvent.type as keyof typeof typeConfig]?.color}`}>
                  {typeConfig[selectedEvent.type as keyof typeof typeConfig]?.label}
                </Badge>
                <h3 className="text-base font-semibold text-foreground">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedEvent.description}</p>
                )}
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground ml-4">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <span>
                {format(parseISO(selectedEvent.start_time), "d 'de' MMMM, HH:mm", { locale: es })}
                {' — '}
                {format(parseISO(selectedEvent.end_time), 'HH:mm')}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteEvent(selectedEvent.id)}
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar evento
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
