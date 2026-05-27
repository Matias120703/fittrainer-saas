import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/settings/SettingsClient'

export const metadata = { title: 'Configuración — FitTrainer' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: trainer }] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, role').eq('id', user.id).single(),
    supabase.from('trainers').select('bio, specialties, instagram_url, website_url').eq('id', user.id).single(),
  ])

  if (!profile || profile.role !== 'trainer') redirect('/home')

  return (
    <SettingsClient
      profile={profile}
      trainer={trainer}
      email={user.email ?? ''}
    />
  )
}
