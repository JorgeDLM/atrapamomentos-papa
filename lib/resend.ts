import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(key)
}

export async function sendContactEmail(data: {
  name: string
  email: string
  message: string
}) {
  const resend = getResend()
  return resend.emails.send({
    from: 'Portfolio <noreply@jorgedelamora.com>',
    to:   process.env.CONTACT_EMAIL!,
    replyTo: data.email,
    subject: `Mensaje de ${data.name} — Portfolio`,
    text: `Nombre: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
  })
}
