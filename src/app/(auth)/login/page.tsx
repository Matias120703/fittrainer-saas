'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Hard redirect — garantiza que las cookies Supabase se envíen correctamente en mobile
    window.location.href = profile?.role === 'trainer' ? '/dashboard' : '/home'
  }

  return (
    <div className="flex min-h-screen">

      {/* Panel izquierdo — estética de la marca DZ: oscuro + dorado */}
      <div
        className="relative hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between overflow-hidden p-14"
        style={{ background: 'oklch(0.06 0.007 65)' }}
      >
        {/* Textura de cuadrícula sutil */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, oklch(0.70 0.14 82 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.70 0.14 82 / 0.04) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
        {/* Brillo dorado inferior izquierdo */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] -translate-x-1/4 translate-y-1/4 rounded-full blur-[120px]"
          style={{ background: 'oklch(0.70 0.14 82 / 0.12)' }}
        />

        {/* Logo top */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-up">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md dz-logo-glow"
            style={{
              background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65))',
            }}
          >
            <span
              className="text-[13px] font-black"
              style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.10 0.006 65)' }}
            >
              DZ
            </span>
          </div>
          <span
            className="text-[13px] font-black uppercase tracking-widest text-gold-gradient"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            FitTrainer
          </span>
        </div>

        {/* Contenido central — con la tipografía y mensajes de Danny */}
        <div className="relative z-10">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em] animate-fade-up delay-100" style={{ color: 'oklch(0.70 0.14 82 / 0.55)' }}>
            Lic. Danny Domínguez — Fisioterapia y Kinesiología
          </p>
          <h1
            className="text-[64px] xl:text-[76px] font-black italic uppercase leading-[0.88] tracking-tight text-gold-gradient animate-fade-up delay-200"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            TRABAJO<br />
            DURO.<br />
            CIENCIA.<br />
            RESULTADOS.
          </h1>

          {/* Línea dorada separadora */}
          <div
            className="mt-7 mb-6 h-px w-20 animate-fade-up delay-300"
            style={{
              background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.8), oklch(0.48 0.10 65 / 0.3))',
            }}
          />

          <p className="text-[14px] font-medium leading-relaxed animate-fade-up delay-450" style={{ color: 'oklch(0.94 0.006 75 / 0.55)' }}>
            "Me dedico al entrenamiento de musculación con más de 13 años de experiencia teórica y práctica."
          </p>

          {/* Stats */}
          <div className="mt-6 flex gap-8 animate-fade-up delay-600">
            {[
              { n: '13+', label: 'Años de exp.' },
              { n: '250+', label: 'Alumnos' },
              { n: '10', label: 'Países' },
            ].map(({ n, label }) => (
              <div key={label}>
                <p
                  className="text-2xl font-black text-gold-gradient"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {n}
                </p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: 'oklch(0.94 0.006 75 / 0.40)' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 animate-fade-in delay-750">
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'oklch(0.70 0.14 82 / 0.30)', fontFamily: 'var(--font-heading)' }}
          >
            DZ Fitness Club · Desde 2014
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-[360px] animate-fade-up delay-100">

          {/* Logo mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md"
              style={{
                background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65))',
              }}
            >
              <span
                className="text-[11px] font-black"
                style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.10 0.006 65)' }}
              >
                DZ
              </span>
            </div>
            <span
              className="text-[14px] font-black uppercase tracking-widest text-gold-gradient"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              FitTrainer
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-4xl font-black italic uppercase leading-tight text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Bienvenido
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Inicia sesión para continuar.
          </p>

          {/* Divider dorado */}
          <div
            className="my-6 h-px w-12"
            style={{
              background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.9), oklch(0.48 0.10 65 / 0.3))',
            }}
          />

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card border-border h-11 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card border-border h-11 text-sm"
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm tracking-wide"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline underline-offset-4">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
