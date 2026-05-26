import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrainerSidebar } from '@/components/layout/TrainerSidebar'

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'trainer') redirect('/home')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <TrainerSidebar
        trainerName={profile.full_name}
        trainerAvatar={profile.avatar_url}
      />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
