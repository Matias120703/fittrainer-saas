// All HTML email templates.
// Uses inline styles only — required for email client compatibility.
// No oklch() — uses hex colors that work across Gmail, Outlook, Apple Mail.

const C = {
  pageBg:      '#0A0907',
  cardBg:      '#141210',
  cardBorder:  '#2E2820',
  infoBg:      '#0E0C09',
  infoBorder:  '#231F1B',
  gold:        '#C5993C',
  goldDark:    '#8C6A24',
  goldBtn:     '#C5993C',
  goldBtnText: '#0E0B06',
  text:        '#F0EDE8',
  muted:       '#7A7065',
  dim:         '#3A3630',
  badgeBg:     '#1E1710',
  badgeBorder: '#3D2D18',
  rejectBg:    '#1A1714',
  rejectBorder:'#3A3228',
  rejectText:  '#6A6460',
  green:       '#4ADE80',
  greenBg:     '#0F2018',
  greenBorder: '#1E4030',
} as const

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>ZD FITNESS</title>
</head>
<body style="margin:0;padding:0;background-color:${C.pageBg};-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${C.pageBg};">
    <tr>
      <td align="center" style="padding:40px 16px 40px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;">

          <!-- ── Logo header ── -->
          <tr>
            <td align="center" style="padding:0 0 28px 0;">
              <!-- ZD Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="52" height="52"
                    style="width:52px;height:52px;background-color:#8C6A24;border-radius:14px;text-align:center;vertical-align:middle;">
                    <span style="display:inline-block;font-size:22px;font-weight:900;font-style:italic;color:#0E0B06;letter-spacing:-0.02em;line-height:52px;">ZD</span>
                  </td>
                </tr>
              </table>
              <!-- Title -->
              <div style="margin-top:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;font-weight:900;font-style:italic;letter-spacing:-0.02em;text-transform:uppercase;color:${C.gold};">
                ZD FITNESS
              </div>
              <!-- Subtitle -->
              <div style="margin-top:5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.28em;color:${C.muted};">
                Entrenamiento personalizado de alto nivel
              </div>
              <!-- Gold divider -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:14px auto 0 auto;">
                <tr>
                  <td width="44" height="1" style="background-color:${C.goldDark};"></td>
                  <td width="8" style="text-align:center;">
                    <div style="width:6px;height:6px;background-color:${C.gold};transform:rotate(45deg);display:inline-block;"></div>
                  </td>
                  <td width="44" height="1" style="background-color:${C.goldDark};"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Main card ── -->
          <tr>
            <td style="background-color:${C.cardBg};border:1px solid ${C.cardBorder};border-radius:20px;overflow:hidden;">
              <!-- Gold top accent -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td height="3" style="background-color:${C.gold};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
              <!-- Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding:32px 32px 36px 32px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td align="center" style="padding:28px 0 0 0;">
              <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:9px;text-transform:uppercase;letter-spacing:0.22em;color:${C.dim};">
                ZD FITNESS · Est. 2014 · Entrenamiento de alto nivel
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Template 1: Trainer notification (new registration) ──────────────────────
export function trainerNotificationEmail({
  clientName,
  clientEmail,
  requestDate,
  appUrl,
}: {
  clientName: string
  clientEmail: string
  requestDate: string
  appUrl: string
}): string {
  const clientsUrl = `${appUrl}/clients`

  const content = `
    <!-- Badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="background-color:${C.badgeBg};border:1px solid ${C.badgeBorder};border-radius:100px;padding:5px 14px;">
          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:${C.gold};">
            ● Nueva solicitud
          </span>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;margin:0 0 8px 0;">
      Solicitud de acceso recibida
    </div>
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:${C.muted};line-height:1.6;margin:0 0 28px 0;">
      Un nuevo cliente quiere unirse a tu plataforma de entrenamiento.
    </div>

    <!-- Client info card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background-color:${C.infoBg};border:1px solid ${C.infoBorder};border-radius:14px;margin:0 0 28px 0;">
      <tr>
        <td style="padding:20px 24px;">

          <!-- Name -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding-bottom:14px;border-bottom:1px solid ${C.infoBorder};">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:${C.muted};margin-bottom:5px;">
                  Nombre completo
                </div>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:${C.text};">
                  ${escapeHtml(clientName)}
                </div>
              </td>
            </tr>
            <!-- Email -->
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid ${C.infoBorder};">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:${C.muted};margin-bottom:5px;">
                  Correo electrónico
                </div>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:${C.gold};">
                  ${escapeHtml(clientEmail)}
                </div>
              </td>
            </tr>
            <!-- Date -->
            <tr>
              <td style="padding-top:14px;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:${C.muted};margin-bottom:5px;">
                  Fecha de solicitud
                </div>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;color:${C.text};">
                  ${escapeHtml(requestDate)}
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

    <!-- CTA Buttons -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 14px 0;">
      <tr>
        <!-- Approve button -->
        <td width="50%" style="padding-right:6px;">
          <a href="${clientsUrl}"
            style="display:block;text-align:center;background-color:${C.goldBtn};color:${C.goldBtnText};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;padding:14px 20px;border-radius:10px;">
            ✓ Gestionar solicitud
          </a>
        </td>
        <!-- Dashboard button -->
        <td width="50%" style="padding-left:6px;">
          <a href="${clientsUrl}"
            style="display:block;text-align:center;background-color:${C.rejectBg};border:1px solid ${C.rejectBorder};color:${C.muted};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;padding:13px 20px;border-radius:10px;">
            Ver panel →
          </a>
        </td>
      </tr>
    </table>

    <!-- Note -->
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;color:${C.dim};text-align:center;line-height:1.5;">
      Los botones te llevan al panel de control para aprobar o rechazar la solicitud.
    </div>
  `

  return emailWrapper(content)
}

// ── Template 2: Client approval ───────────────────────────────────────────────
export function approvedEmail({
  clientName,
  appUrl,
}: {
  clientName: string
  appUrl: string
}): string {
  const loginUrl = `${appUrl}/login`
  const firstName = clientName.split(' ')[0] ?? clientName

  const content = `
    <!-- Success badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="background-color:${C.greenBg};border:1px solid ${C.greenBorder};border-radius:100px;padding:5px 14px;">
          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:${C.green};">
            ✓ Acceso aprobado
          </span>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;font-weight:700;color:${C.text};line-height:1.3;margin:0 0 10px 0;">
      ¡Bienvenido/a, ${escapeHtml(firstName)}!
    </div>
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:${C.muted};line-height:1.7;margin:0 0 28px 0;">
      Tu solicitud fue revisada y tu acceso fue <strong style="color:${C.green};">aprobado</strong>.
      Ya podés ingresar a la plataforma y comenzar tu entrenamiento personalizado.
    </div>

    <!-- Account card -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
      style="background-color:${C.infoBg};border:1px solid ${C.infoBorder};border-radius:14px;margin:0 0 28px 0;">
      <tr>
        <td style="padding:18px 24px;">
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.18em;color:${C.muted};margin-bottom:5px;">
            Cuenta activa
          </div>
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:${C.text};">
            ${escapeHtml(clientName)}
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td>
          <a href="${loginUrl}"
            style="display:block;text-align:center;background-color:${C.goldBtn};color:${C.goldBtnText};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;text-decoration:none;padding:15px 24px;border-radius:12px;">
            Ingresar a ZD FITNESS →
          </a>
        </td>
      </tr>
    </table>
  `

  return emailWrapper(content)
}

// ── Template 3: Client rejection ──────────────────────────────────────────────
export function rejectedEmail({
  clientName,
}: {
  clientName: string
}): string {
  const firstName = clientName.split(' ')[0] ?? clientName

  const content = `
    <!-- Status badge -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px 0;">
      <tr>
        <td style="background-color:${C.rejectBg};border:1px solid ${C.rejectBorder};border-radius:100px;padding:5px 14px;">
          <span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;color:${C.muted};">
            Actualización de solicitud
          </span>
        </td>
      </tr>
    </table>

    <!-- Heading -->
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:${C.text};line-height:1.3;margin:0 0 10px 0;">
      Hola, ${escapeHtml(firstName)}
    </div>
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:${C.muted};line-height:1.7;margin:0 0 24px 0;">
      Luego de revisar tu solicitud, en este momento no fue posible aprobar tu acceso a la plataforma.
    </div>

    <!-- Divider -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 24px 0;">
      <tr>
        <td height="1" style="background-color:${C.infoBorder};font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>

    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:${C.muted};line-height:1.7;margin:0 0 6px 0;">
      Si tenés alguna consulta o creés que hubo un error, podés comunicarte directamente con el entrenador.
    </div>
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;color:${C.muted};line-height:1.7;">
      Gracias por tu interés en ZD FITNESS.
    </div>
  `

  return emailWrapper(content)
}

// ── Utility ───────────────────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
