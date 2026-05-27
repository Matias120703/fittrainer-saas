import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('[email] RESEND_API_KEY no está configurada')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Sender address — set RESEND_FROM_EMAIL in Vercel, e.g: "ZD FITNESS <noreply@tudominio.com>"
// If domain not verified, use Resend's shared domain for testing.
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'ZD FITNESS <onboarding@resend.dev>'
