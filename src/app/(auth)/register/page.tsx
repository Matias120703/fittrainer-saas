'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'trainer' | 'client'

export default function RegisterPage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Error al crear la cuenta.')
      setLoading(false)
      return
    }

    // DB trigger auto-creates the profiles row from user_metadata on signup.
    // Only insert into trainers table for trainer accounts.
    if (role === 'trainer') {
      await supabase.from('trainers').upsert({ id: data.user.id }, { onConflict: 'id' })
    }

    window.location.href = role === 'trainer' ? '/dashboard' : '/home'
  }

  return (
    <div className="flex min-h-screen">

      {/* Panel izquierdo — marca DZ */}
      <div
        className="relative hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col justify-between overflow-hidden p-14"
        style={{ background: 'oklch(0.06 0.007 65)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, oklch(0.70 0.14 82 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.70 0.14 82 / 0.04) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] -translate-x-1/4 translate-y-1/4 rounded-full blur-[120px]"
          style={{ background: 'oklch(0.70 0.14 82 / 0.12)' }}
        />

        {/* Logo top */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md"
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

        {/* Contenido central */}
        <div className="relative z-10">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: 'oklch(0.70 0.14 82 / 0.55)' }}>
            Empieza hoy
          </p>
          <h1
            className="text-[64px] xl:text-[76px] font-black italic uppercase leading-[0.88] tracking-tight text-gold-gradient"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            TU MEJOR<br />
            VERSIÓN<br />
            TE ESPERA.
          </h1>

          <div
            className="mt-7 mb-6 h-px w-20"
            style={{
              background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.8), oklch(0.48 0.10 65 / 0.3))',
            }}
          />

          <p className="text-[14px] font-medium leading-relaxed" style={{ color: 'oklch(0.94 0.006 75 / 0.55)' }}>
            "Amante del trabajo duro e inteligente."
          </p>

          <div className="mt-6 flex gap-8">
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

        <div className="relative z-10">
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'oklch(0.70 0.14 82 / 0.30)', fontFamily: 'var(--font-heading)' }}
          >
            DZ Fitness Club · Desde 2014
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex flex-1 items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-[360px]">

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

          <h2
            className="text-4xl font-black italic uppercase leading-tight text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Crear cuenta
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Únete a FitTrainer y empieza hoy.
          </p>

          <div
            className="my-6 h-px w-12"
            style={{
              background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.9), oklch(0.48 0.10 65 / 0.3))',
            }}
          />

          {/* Role selector */}
          <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-card p-1">
            {(['trainer', 'client'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  'rounded-md py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150',
                  role === r
                    ? 'text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                style={role === r ? {
                  background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.76 0.14 82) 50%, oklch(0.48 0.10 65))',
                } : {}}
              >
                {r === 'trainer' ? 'Entrenador' : 'Cliente'}
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Nombre completo
              </Label>
              <Input
                id="name"
                placeholder="Danny Domínguez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-card border-border h-11 text-sm"
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
              Crear cuenta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
