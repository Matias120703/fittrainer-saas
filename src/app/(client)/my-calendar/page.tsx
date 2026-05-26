import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function ClientCalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientRecord } = await supabase
    .from('clients')
    .select('id, trainer_id')
    .eq('user_id', user.id)
    .single()

  if (!clientRecord) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Sin eventos disponibles</p>
      </div>
    )
  }

  const now = new Date()
  const { data: events } = await supabase
    .from('calendar_events')
    .select('id, title, description, start_time, end_time, type')
    .eq('trainer_id', clientRecord.trainer_id)
    .eq('client_id', clientRecord.id)
    .gte('start_time', now.toISOString())
    .order('start_time')
    .limit(20)

  const typeConfig = {
    session: { label: 'Sesión', class: 'border-primary/30 text-primary bg-primary/10' },
    reminder: { label: 'Recordatorio', class: 'border-amber-400/30 text-amber-400 bg-amber-400/10' },
    rest: { label: 'Descanso', class: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10' },
    other: { label: 'Otro', class: 'border-border text-muted-foreground' },
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mi Calendario</h1>
        <p className="text-sm text-muted-foreground mt-1">Próximos eventos con tu entrenador</p>
      </div>

      {!events || events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border py-16 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No hay eventos próximos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const start = new Date(event.start_time)
            const tc = typeConfig[event.type as keyof typeof typeConfig] ?? typeConfig.other
            const dayLabel = isToday(start) ? 'Hoy' : isTomorrow(start) ? 'Mañana' : format(start, "EEEE d 'de' MMMM", { locale: es })

            return (
              <Card key={event.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="shrink-0 rounded-lg bg-primary/10 p-2.5 text-center min-w-[48px]">
                    <p className="text-xs text-primary font-medium">{format(start, 'MMM', { locale: es }).toUpperCase()}</p>
                    <p className="text-lg font-bold text-primary leading-none">{format(start, 'd')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{event.title}</p>
                      <Badge variant="outline" className={`text-xs ${tc.class}`}>{tc.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{dayLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(start, 'HH:mm')} — {format(new Date(event.end_time), 'HH:mm')}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
