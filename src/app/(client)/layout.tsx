import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/layout/ClientSidebar'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'client') redirect('/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar
        clientName={profile.full_name}
        clientAvatar={profile.avatar_url}
      />
      {/* pb-16 = bottom nav height on mobile */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
