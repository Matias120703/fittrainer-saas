'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
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
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId]   = useState<string | null>(null)
  const [errorMsg, setErrorMsg]     = useState<string | null>(null)
  const [processed, setProcessed]   = useState<Set<string>>(new Set())

  if (pending.length === 0) return null

  function handle(id: string, status: 'approved' | 'rejected') {
    if (loadingId) return
    setLoadingId(id)
    setErrorMsg(null)

    startTransition(async () => {
      try {
        await updateClientStatus(id, status)
        setProcessed((prev) => new Set(prev).add(id))
        router.refresh()
      } catch (err) {
        console.error('[PendingRequests] Error:', err)
        setErrorMsg('No se pudo procesar la solicitud. Intentá nuevamente.')
      } finally {
        setLoadingId(null)
      }
    })
  }

  const visible = pending.filter((p) => !processed.has(p.id))
  if (visible.length === 0) return null

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
          className="h-2 w-2 rounded-full shrink-0"
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
          {visible.length}
        </span>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-5 py-3 text-sm text-destructive"
            style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderBottom: '1px solid oklch(0.62 0.22 25 / 0.15)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
            <button
              onClick={() => setErrorMsg(null)}
              className="ml-auto text-xs underline opacity-70 hover:opacity-100"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <AnimatePresence>
        {visible.map((profile, i) => {
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

          const isLoading = loadingId === profile.id
          const isBlocked = loadingId !== null && loadingId !== profile.id

          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, transition: { duration: 0.25 } }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="flex items-center gap-3 px-5 py-3.5 border-b last:border-0"
              style={{
                borderColor: 'oklch(0.94 0.006 75 / 0.04)',
                opacity: isBlocked ? 0.45 : 1,
                transition: 'opacity 0.2s',
              }}
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
                {/* Reject button */}
                <button
                  onClick={() => handle(profile.id, 'rejected')}
                  disabled={isLoading || isBlocked}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-500/10 disabled:cursor-not-allowed"
                  title="Rechazar"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 text-muted-foreground/40 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400/60 hover:text-red-400 transition-colors" />
                  )}
                </button>

                {/* Approve button */}
                <button
                  onClick={() => handle(profile.id, 'approved')}
                  disabled={isLoading || isBlocked}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: isLoading
                      ? 'oklch(0.40 0.08 68)'
                      : 'linear-gradient(135deg, oklch(0.44 0.10 63), oklch(0.82 0.14 88) 50%, oklch(0.44 0.10 63))',
                    color: 'oklch(0.06 0.006 65)',
                    boxShadow: isLoading ? 'none' : '0 0 12px oklch(0.72 0.14 82 / 0.2)',
                  }}
                  title="Aprobar"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Aprobar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </motion.div>
  )
}
