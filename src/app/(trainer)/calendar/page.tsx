import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/trainer/CalendarView'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59).toISOString()

  const [{ data: events }, { data: clients }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('id, title, description, start_time, end_time, type, client_id')
      .eq('trainer_id', user.id)
      .gte('start_time', startOfMonth)
      .lte('end_time', endOfMonth)
      .order('start_time'),
    supabase
      .from('clients')
      .select('id, full_name')
      .eq('trainer_id', user.id)
      .eq('status', 'active')
      .order('full_name'),
  ])

  return (
    <div className="p-6 lg:p-8 h-full">
      <CalendarView
        initialEvents={events ?? []}
        clients={clients ?? []}
        trainerId={user.id}
      />
    </div>
  )
}
