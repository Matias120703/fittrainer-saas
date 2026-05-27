'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { approvedEmail, rejectedEmail } from '@/lib/email/templates'

export async function updateClientStatus(
  profileId: string,
  status: 'approved' | 'rejected',
): Promise<void> {
  const supabase = await createClient()

  // ── Auth check ──────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: currentUser } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (currentUser?.role !== 'trainer') throw new Error('No autorizado')

  // ── Update status ────────────────────────────────────────
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', profileId)
    .select('full_name')
    .single()

  if (error) {
    console.error('[approvals] Error al actualizar status:', error)
    throw error
  }

  const clientName = updatedProfile?.full_name ?? 'Cliente'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  console.log(`[approvals] ✓ Status actualizado: ${clientName} → ${status}`)

  // ── Send email to client (non-blocking) ──────────────────
  try {
    const adminClient = createAdminClient()
    const { data: authData, error: adminError } = await adminClient.auth.admin.getUserById(profileId)

    if (adminError) {
      console.warn('[approvals] No se pudo obtener email del usuario:', adminError.message)
    } else {
      const clientEmail = authData?.user?.email
      if (clientEmail) {
        await sendStatusEmail({ clientName, clientEmail, status, appUrl })
      } else {
        console.warn('[approvals] Usuario sin email registrado:', profileId)
      }
    }
  } catch (err) {
    // Email failure must NOT block the approval — log and continue
    console.error('[approvals] Error enviando email al cliente:', err)
  }

  revalidatePath('/clients')
  revalidatePath('/dashboard')
}

async function sendStatusEmail({
  clientName,
  clientEmail,
  status,
  appUrl,
}: {
  clientName: string
  clientEmail: string
  status: 'approved' | 'rejected'
  appUrl: string
}) {
  const resend = getResend()

  const html = status === 'approved'
    ? approvedEmail({ clientName, appUrl })
    : rejectedEmail({ clientName })

  const subject = status === 'approved'
    ? '¡Tu acceso fue aprobado! — ZD FITNESS'
    : 'Actualización sobre tu solicitud — ZD FITNESS'

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: clientEmail,
    subject,
    html,
  })

  if (error) {
    console.error(`[approvals] Error de Resend (${status}):`, error)
  } else {
    console.log(`[approvals] ✓ Email enviado a ${clientEmail}: ${subject}`)
  }
}
