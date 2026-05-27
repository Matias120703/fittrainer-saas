'use server'

import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { trainerNotificationEmail } from '@/lib/email/templates'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function notifyTrainerNewRegistration(
  clientName: string,
  clientEmail: string,
): Promise<void> {
  // ── Env diagnostics ─────────────────────────────────────
  const trainerEmail = process.env.TRAINER_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const hasResendKey = !!process.env.RESEND_API_KEY
  const fromEmail = FROM_EMAIL

  console.log('[notifications] called', {
    clientName,
    clientEmail,
    trainerEmail: trainerEmail ?? '⚠ NOT SET',
    appUrl: appUrl || '⚠ NOT SET',
    hasResendKey,
    fromEmail,
  })

  if (!trainerEmail) {
    console.error('[notifications] ❌ TRAINER_EMAIL no configurado — email no enviado')
    return
  }

  if (!hasResendKey) {
    console.error('[notifications] ❌ RESEND_API_KEY no configurado — email no enviado')
    return
  }

  const requestDate = format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  const html = trainerNotificationEmail({ clientName, clientEmail, requestDate, appUrl })

  try {
    const resend = getResend()
    console.log('[notifications] Llamando resend.emails.send...')

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: trainerEmail,
      subject: `Nueva solicitud de acceso — ${clientName}`,
      html,
    })

    if (error) {
      console.error('[notifications] ❌ Error de Resend:', JSON.stringify(error))
    } else {
      console.log(`[notifications] ✓ Email enviado. ID: ${data?.id} → ${trainerEmail}`)
    }
  } catch (err) {
    console.error('[notifications] ❌ Excepción al enviar:', err instanceof Error ? err.message : err)
  }
}
