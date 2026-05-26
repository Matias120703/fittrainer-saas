import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RoutineBuilder } from '@/components/trainer/RoutineBuilder'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RoutineEditorPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const [{ data: routine }, { data: exercises }] = await Promise.all([
    supabase
      .from('routines')
      .select('*, routine_exercises(*, exercises(*))')
      .eq('id', id)
      .eq('trainer_id', user.id)
      .single(),
    supabase
      .from('exercises')
      .select('*')
      .or(`created_by.eq.${user.id},is_global.eq.true`)
      .order('name'),
  ])

  if (!routine) notFound()

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <Link href="/routines" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a rutinas
      </Link>

      <RoutineBuilder routine={routine} exercises={exercises ?? []} />
    </div>
  )
}
