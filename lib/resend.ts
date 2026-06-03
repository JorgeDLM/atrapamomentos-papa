import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(data: {
  name: string
  email: string
  message: string
}) {
  return resend.emails.send({
    from: 'Portfolio <noreply@jorgedelamora.com>',
    to:   process.env.CONTACT_EMAIL!,
    replyTo: data.email,
    subject: `Mensaje de ${data.name} — Portfolio`,
    text: `Nombre: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
  })
}
