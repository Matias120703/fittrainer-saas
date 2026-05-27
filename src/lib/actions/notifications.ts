'use server'

import { getResend, FROM_EMAIL } from '@/lib/email/client'
import { trainerNotificationEmail } from '@/lib/email/templates'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function notifyTrainerNewRegistration(
  clientName: string,
  clientEmail: string,
): Promise<void> {
  const trainerEmail = process.env.TRAINER_EMAIL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!trainerEmail) {
    console.warn('[notifications] TRAINER_EMAIL no configurado — omitiendo notificación')
    return
  }

  const requestDate = format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })
  const html = trainerNotificationEmail({ clientName, clientEmail, requestDate, appUrl })

  try {
    const resend = getResend()
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: trainerEmail,
      subject: `Nueva solicitud de acceso — ${clientName}`,
      html,
    })

    if (error) {
      console.error('[notifications] Error de Resend:', error)
    } else {
      console.log(`[notifications] ✓ Entrenador notificado (${trainerEmail}) sobre: ${clientName}`)
    }
  } catch (err) {
    console.error('[notifications] No se pudo enviar la notificación al entrenador:', err)
  }
}
