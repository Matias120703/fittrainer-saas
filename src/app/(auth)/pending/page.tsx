'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Clock, LogOut, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const ease = [0.22, 1, 0.36, 1] as const

function PremiumBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      <div className="absolute inset-0" style={{ background: 'oklch(0.055 0.007 65)' }} />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, oklch(0.72 0.14 82 / 0.025) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.72 0.14 82 / 0.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 800, height: 800,
          background: 'radial-gradient(circle, oklch(0.72 0.14 82 / 0.10) 0%, transparent 65%)',
          bottom: '-28%', left: '-20%',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, oklch(0.58 0.14 230 / 0.05) 0%, transparent 70%)',
          top: '-10%', right: '-10%',
        }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
    </div>
  )
}

export default function PendingPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [fullName, setFullName] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function check() {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status, full_name')
        .eq('id', user.id)
        .single()

      if (profile?.status === 'approved') {
        router.replace(profile.role === 'trainer' ? '/dashboard' : '/home')
        return
      }

      setEmail(user.email ?? '')
      setFullName(profile?.full_name ?? '')
      setChecking(false)
    }

    check()
  }, [router])

  async function handleSignOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (checking) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <PremiumBackground />
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-14 overflow-x-hidden">
      <PremiumBackground />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* ── Logo hero ── */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 9, stiffness: 130 }}
              className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] dz-logo-glow"
              style={{
                background: 'linear-gradient(145deg, oklch(0.42 0.10 63) 0%, oklch(0.88 0.10 88) 48%, oklch(0.60 0.14 80) 72%, oklch(0.42 0.10 63) 100%)',
              }}
            >
              <div
                className="absolute inset-[3.5px] rounded-[17px] opacity-25"
                style={{ border: '1px solid oklch(0.06 0.006 65)' }}
              />
              <span
                className="relative text-[28px] font-black italic leading-none"
                style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.055 0.006 65)', letterSpacing: '-0.02em' }}
              >
                ZD
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65, ease }}
            className="text-[52px] sm:text-[60px] font-black italic uppercase leading-none text-gold-gradient"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}
          >
            ZD FITNESS
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="flex items-center gap-2.5"
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.72 0.14 82 / 0.45))' }} />
            <div className="w-1.5 h-1.5 rotate-45 rounded-[1px]" style={{ background: 'oklch(0.72 0.14 82 / 0.55)' }} />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, oklch(0.72 0.14 82 / 0.45), transparent)' }} />
          </motion.div>
        </div>

        {/* ── Pending card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease }}
          className="w-full rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center"
          style={{
            background: 'oklch(0.11 0.007 65 / 0.82)',
            backdropFilter: 'blur(36px)',
            WebkitBackdropFilter: 'blur(36px)',
            border: '1px solid oklch(0.94 0.006 75 / 0.08)',
            boxShadow: '0 40px 100px oklch(0 0 0 / 0.5), 0 0 50px oklch(0.72 0.14 82 / 0.07), 0 0 0 1px oklch(0.72 0.14 82 / 0.05)',
          }}
        >
          {/* Animated clock icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', damping: 10 }}
            className="relative mb-6 flex h-[72px] w-[72px] items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(oklch(0.72 0.14 82) 0%, transparent 55%, oklch(0.72 0.14 82 / 0.2) 80%, transparent 100%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <div
              className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full"
              style={{ background: 'oklch(0.10 0.007 65)' }}
            >
              <Clock className="h-6 w-6" style={{ color: 'oklch(0.72 0.14 82)' }} />
            </div>
          </motion.div>

          {fullName && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.55, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2"
            >
              Hola, {fullName.split(' ')[0]}
            </motion.p>
          )}

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5, ease }}
            className="text-[24px] font-bold text-foreground mb-3"
          >
            Solicitud en revisión
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.65, y: 0 }}
            transition={{ delay: 0.72, duration: 0.5 }}
            className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[300px]"
          >
            Tu cuenta está pendiente de aprobación. El entrenador habilitará tu acceso en breve.
          </motion.p>

          {/* Email display */}
          {email && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78, duration: 0.5 }}
              className="w-full mb-7 rounded-xl px-4 py-3"
              style={{
                background: 'oklch(0.085 0.007 65 / 0.8)',
                border: '1px solid oklch(0.94 0.006 75 / 0.07)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground/50 mb-1">
                Cuenta registrada
              </p>
              <p className="text-sm font-medium text-foreground truncate">{email}</p>
            </motion.div>
          )}

          {/* Status indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="flex items-center gap-2 mb-7 rounded-full px-4 py-2"
            style={{
              background: 'oklch(0.72 0.14 82 / 0.08)',
              border: '1px solid oklch(0.72 0.14 82 / 0.15)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'oklch(0.72 0.14 82)' }}
            />
            <span className="text-[11px] font-semibold" style={{ color: 'oklch(0.72 0.14 82)' }}>
              Pendiente de aprobación
            </span>
          </motion.div>

          {/* Sign out */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-200"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.28 }}
          transition={{ delay: 1.2, duration: 1.2 }}
          className="mt-8 text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ZD FITNESS · Est. 2014
        </motion.p>
      </div>
    </div>
  )
}
