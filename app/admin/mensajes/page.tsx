import { db } from '@/lib/db'
import MessageActions from './MessageActions'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function MensajesPage() {
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const unread = messages.filter((m) => !m.read).length

  return (
    <div>
      <div className="flex items-baseline gap-4 mb-10">
        <h1 className="font-serif text-2xl">Mensajes de contacto</h1>
        {unread > 0 && (
          <span className="text-xs uppercase tracking-widest text-accent">
            {unread} sin leer
          </span>
        )}
      </div>

      {messages.length === 0 && (
        <p className="py-12 text-center text-stone-warm font-serif italic">
          Todavia no hay mensajes.
        </p>
      )}

      <div className="divide-y divide-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`py-6 ${msg.read ? 'opacity-60' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  {!msg.read && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                  <p className="font-serif text-base text-stone-dark">{msg.name}</p>
                  <p className="text-xs text-stone-warm">{msg.email}</p>
                </div>
                <p className="text-xs text-stone-warm/60 mb-3">{formatDate(msg.createdAt)}</p>
                <p className="text-sm text-stone-dark leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
            <MessageActions id={msg.id} read={msg.read} />
          </div>
        ))}
      </div>
    </div>
  )
}
