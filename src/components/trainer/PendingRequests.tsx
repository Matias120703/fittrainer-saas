'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { updateClientStatus } from '@/lib/actions/approvals'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export type PendingProfile = {
  id: string
  full_name: string
  created_at: string
}

export function PendingRequests({ pending }: { pending: PendingProfile[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (pending.length === 0) return null

  function handle(id: string, status: 'approved' | 'rejected') {
    startTransition(async () => {
      await updateClientStatus(id, status)
      router.refresh()
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 rounded-2xl overflow-hidden"
      style={{
        background: 'oklch(0.11 0.007 65 / 0.9)',
        border: '1px solid oklch(0.72 0.14 82 / 0.18)',
        boxShadow: '0 0 30px oklch(0.72 0.14 82 / 0.05)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b"
        style={{ borderColor: 'oklch(0.72 0.14 82 / 0.12)' }}
      >
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2 w-2 rounded-full"
          style={{ background: 'oklch(0.72 0.14 82)' }}
        />
        <h3 className="text-sm font-semibold text-foreground">
          Solicitudes pendientes
        </h3>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: 'oklch(0.72 0.14 82 / 0.15)',
            color: 'oklch(0.72 0.14 82)',
          }}
        >
          {pending.length}
        </span>
      </div>

      {/* List */}
      <AnimatePresence>
        {pending.map((profile, i) => {
          const initials = profile.full_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)

          const timeAgo = formatDistanceToNow(new Date(profile.created_at), {
            addSuffix: true,
            locale: es,
          })

          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, height: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0"
              style={{ borderColor: 'oklch(0.94 0.006 75 / 0.04)' }}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback
                  className="text-[11px] font-black"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.82 0.12 88))',
                    color: 'oklch(0.08 0.006 65)',
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {profile.full_name}
                </p>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground/60 mt-0.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  {timeAgo}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handle(profile.id, 'rejected')}
                  disabled={isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-500/10 disabled:opacity-40"
                  title="Rechazar"
                >
                  <XCircle className="h-4.5 w-4.5 text-red-400/70 hover:text-red-400" />
                </button>
                <button
                  onClick={() => handle(profile.id, 'approved')}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, oklch(0.44 0.10 63), oklch(0.82 0.14 88) 50%, oklch(0.44 0.10 63))',
                    color: 'oklch(0.06 0.006 65)',
                    boxShadow: '0 0 12px oklch(0.72 0.14 82 / 0.2)',
                  }}
                  title="Aprobar"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Aprobar
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
