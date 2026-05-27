'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

// ── Animated background ──────────────────────────────────
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
          background: 'radial-gradient(circle, oklch(0.72 0.14 82 / 0.12) 0%, transparent 65%)',
          bottom: '-28%', left: '-20%',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 540, height: 540,
          background: 'radial-gradient(circle, oklch(0.58 0.14 230 / 0.06) 0%, transparent 70%)',
          top: '-16%', right: '-13%',
        }}
        animate={{ scale: [1, 1.14, 1], opacity: [0.45, 0.75, 0.45] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 240, height: 240,
          background: 'radial-gradient(circle, oklch(0.72 0.14 82 / 0.07) 0%, transparent 70%)',
          top: '13%', left: '50%', marginLeft: -120,
        }}
        animate={{ y: [0, -24, 0], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 200, height: 200,
          background: 'radial-gradient(circle, oklch(0.72 0.14 82 / 0.055) 0%, transparent 70%)',
          top: '48%', right: '6%',
        }}
        animate={{ y: [0, 18, 0], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
      />
    </div>
  )
}

// ── Premium input ────────────────────────────────────────
function PremiumInput({
  id, type, value, onChange, placeholder, icon: Icon, rightSlot, required,
}: {
  id: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
  icon: React.ElementType; rightSlot?: React.ReactNode; required?: boolean
}) {
  return (
    <div className="relative group">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/45 transition-colors duration-300 group-focus-within:text-primary/70" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="peer w-full h-12 pl-11 pr-12 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none transition-all duration-300"
        style={{
          background: 'oklch(0.085 0.007 65 / 0.85)',
          border: '1px solid oklch(0.94 0.006 75 / 0.07)',
          boxShadow: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = '1px solid oklch(0.72 0.14 82 / 0.5)'
          e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.72 0.14 82 / 0.08), inset 0 1px 0 oklch(0.72 0.14 82 / 0.04)'
          e.currentTarget.style.background = 'oklch(0.095 0.007 65 / 0.9)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = '1px solid oklch(0.94 0.006 75 / 0.07)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.background = 'oklch(0.085 0.007 65 / 0.85)'
        }}
      />
      {rightSlot && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) { setError(authError.message); setLoading(false); return }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()

      if (profile?.status === 'pending') {
        window.location.href = '/pending'
        return
      }

      if (profile?.status === 'rejected') {
        setError('Tu acceso fue rechazado. Contacta al entrenador para más información.')
        setLoading(false)
        return
      }

      window.location.href = profile?.role === 'trainer' ? '/dashboard' : '/home'
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Error inesperado.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-14 overflow-x-hidden">
      <PremiumBackground />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">

        {/* ── Logo hero ── */}
        <div className="mb-11 flex flex-col items-center gap-4">
          {/* Floating wrapper */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 9, stiffness: 130, delay: 0.05 }}
              className="relative flex h-[80px] w-[80px] items-center justify-center rounded-[22px] dz-logo-glow"
              style={{
                background: 'linear-gradient(145deg, oklch(0.42 0.10 63) 0%, oklch(0.88 0.10 88) 48%, oklch(0.60 0.14 80) 72%, oklch(0.42 0.10 63) 100%)',
              }}
            >
              <div
                className="absolute inset-[3.5px] rounded-[17px] opacity-25"
                style={{ border: '1px solid oklch(0.06 0.006 65)' }}
              />
              <span
                className="relative text-[30px] font-black italic leading-none"
                style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.055 0.006 65)', letterSpacing: '-0.02em' }}
              >
                ZD
              </span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.65, ease }}
            className="text-[54px] sm:text-[62px] font-black italic uppercase leading-none text-gold-gradient"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.025em' }}
          >
            ZD FITNESS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.42, y: 0 }}
            transition={{ delay: 0.52, duration: 0.9 }}
            className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-foreground text-center leading-relaxed"
          >
            Entrenamiento personalizado de alto nivel
          </motion.p>

          {/* Diamond ornament divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.9 }}
            className="flex items-center gap-2.5 mt-0.5"
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, oklch(0.72 0.14 82 / 0.45))' }} />
            <div className="w-1.5 h-1.5 rotate-45 rounded-[1px]" style={{ background: 'oklch(0.72 0.14 82 / 0.55)' }} />
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, oklch(0.72 0.14 82 / 0.45), transparent)' }} />
          </motion.div>
        </div>

        {/* ── Glass card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.38, duration: 0.7, ease }}
          className="w-full rounded-3xl p-7 sm:p-8"
          style={{
            background: 'oklch(0.11 0.007 65 / 0.80)',
            backdropFilter: 'blur(36px)',
            WebkitBackdropFilter: 'blur(36px)',
            border: '1px solid oklch(0.94 0.006 75 / 0.08)',
            boxShadow: '0 40px 100px oklch(0 0 0 / 0.5), 0 0 50px oklch(0.72 0.14 82 / 0.07), 0 0 0 1px oklch(0.72 0.14 82 / 0.05)',
          }}
        >
          <div className="mb-6">
            <h2 className="text-[22px] font-bold text-foreground">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-muted-foreground/70">Ingresá tus credenciales para continuar.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.5, ease }}
            >
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground/60">
                Correo electrónico
              </label>
              <PremiumInput
                id="email" type="email" value={email} onChange={setEmail}
                placeholder="tu@email.com" icon={Mail} required
              />
            </motion.div>

            <motion.div
              className="space-y-1.5"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.62, duration: 0.5, ease }}
            >
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.17em] text-muted-foreground/60">
                Contraseña
              </label>
              <PremiumInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password} onChange={setPassword}
                placeholder="••••••••" icon={Lock} required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-xl border border-destructive/20 bg-destructive/[0.08] px-3.5 py-2.5 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              className="pt-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72, duration: 0.5, ease }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015, boxShadow: '0 0 36px oklch(0.72 0.14 82 / 0.38)' }}
                whileTap={{ scale: 0.975 }}
                className="btn-gold w-full h-12 rounded-xl text-[13px] font-bold uppercase tracking-wider disabled:opacity-55 transition-opacity"
              >
                {loading
                  ? <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  : <span className="flex items-center justify-center gap-2">Ingresar <ArrowRight className="h-4 w-4" /></span>
                }
              </motion.button>
            </motion.div>
          </form>

          <div
            className="my-5 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, oklch(0.94 0.006 75 / 0.07), transparent)' }}
          />

          <p className="text-center text-sm text-muted-foreground/60">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
              Solicitar acceso
            </Link>
          </p>
        </motion.div>

        {/* ── Footer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.28 }}
          transition={{ delay: 1.0, duration: 1.2 }}
          className="mt-8 text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          ZD FITNESS · Est. 2014
        </motion.p>
      </div>
    </div>
  )
}
