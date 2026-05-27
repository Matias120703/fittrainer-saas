'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'trainer' | 'client'

const ease = [0.22, 1, 0.36, 1] as const

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState<Role>('client')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        console.error('signUp error:', signUpError)
        setError(signUpError.message)
        setLoading(false)
        return
      }

      window.location.href = '/login'
    } catch (err) {
      console.error('handleRegister error:', err)
      setError(err instanceof Error ? err.message : 'Error inesperado.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">

      {/* ── Left panel (desktop) ── */}
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 flex-col justify-between overflow-hidden p-14"
        style={{ background: 'oklch(0.055 0.007 65)' }}
      >
        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, oklch(0.72 0.14 82 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.72 0.14 82 / 0.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }} />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[520px] w-[520px] -translate-x-1/3 translate-y-1/3 rounded-full blur-[140px]" style={{ background: 'oklch(0.72 0.14 82 / 0.13)' }} />
        <div className="pointer-events-none absolute top-0 right-0 h-[280px] w-[280px] translate-x-1/3 -translate-y-1/3 rounded-full blur-[100px]" style={{ background: 'oklch(0.72 0.14 82 / 0.06)' }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl dz-logo-glow" style={{ background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65))' }}>
            <span className="text-[14px] font-black" style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.08 0.006 65)' }}>DZ</span>
          </div>
          <span className="text-[13px] font-black uppercase tracking-widest text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>FitTrainer</span>
        </motion.div>

        {/* Hero text */}
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em]"
            style={{ color: 'oklch(0.72 0.14 82 / 0.55)' }}
          >
            Empieza hoy
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8, ease }}
            className="text-[64px] xl:text-[76px] font-black italic uppercase leading-[0.87] tracking-tight text-gold-gradient"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            TU MEJOR<br />VERSIÓN<br />TE ESPERA.
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.75, duration: 0.5, ease }}
            style={{ transformOrigin: 'left', background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.8), oklch(0.48 0.10 65 / 0.3))' }}
            className="mt-7 mb-6 h-px w-20"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="text-[14px] font-medium leading-relaxed"
            style={{ color: 'oklch(0.94 0.006 75 / 0.50)' }}
          >
            "Amante del trabajo duro e inteligente."
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6, ease }}
            className="mt-8 flex gap-10"
          >
            {[{ n: '13+', label: 'Años exp.' }, { n: '250+', label: 'Alumnos' }, { n: '10', label: 'Países' }].map(({ n, label }) => (
              <div key={label}>
                <p className="text-[28px] font-black text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>{n}</p>
                <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: 'oklch(0.94 0.006 75 / 0.38)' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="relative z-10 text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'oklch(0.72 0.14 82 / 0.28)', fontFamily: 'var(--font-heading)' }}
        >
          DZ Fitness Club · Desde 2014
        </motion.p>
      </motion.div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-16 md:px-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-[380px]"
        >
          {/* Mobile logo */}
          <motion.div variants={itemVariants} className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl dz-logo-glow" style={{ background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65))' }}>
              <span className="text-[12px] font-black" style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.08 0.006 65)' }}>DZ</span>
            </div>
            <span className="text-[13px] font-black uppercase tracking-widest text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>FitTrainer</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-[42px] font-black italic uppercase leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Crear cuenta
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-1.5 text-sm text-muted-foreground">
            Únete a FitTrainer y empieza hoy.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="my-6 h-px w-12"
            style={{ background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.9), oklch(0.48 0.10 65 / 0.3))' }}
          />

          {/* Role selector */}
          <motion.div variants={itemVariants} className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-card p-1">
            {(['trainer', 'client'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'relative rounded-lg py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150',
                  role === r ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                style={role === r ? {
                  background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.80 0.14 88) 50%, oklch(0.48 0.10 65))',
                  color: 'oklch(0.08 0.006 65)',
                } : {}}
              >
                {r === 'trainer' ? 'Entrenador' : 'Cliente'}
              </button>
            ))}
          </motion.div>

          <form onSubmit={handleRegister} className="space-y-4">
            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-card border-border text-sm focus-visible:ring-primary/60"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 rounded-xl bg-card border-border text-sm focus-visible:ring-primary/60"
              />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015, boxShadow: '0 0 28px oklch(0.72 0.14 82 / 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 rounded-xl text-[13px] font-bold uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.52 0.11 70) 0%, oklch(0.80 0.14 88) 50%, oklch(0.52 0.11 70) 100%)',
                  color: 'oklch(0.08 0.006 65)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><span>Crear cuenta</span><ArrowRight className="h-4 w-4" /></>
                  }
                </span>
              </motion.button>
            </motion.div>
          </form>

          <motion.p variants={itemVariants} className="mt-7 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Iniciá sesión
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
