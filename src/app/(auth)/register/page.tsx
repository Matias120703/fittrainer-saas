'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createBrowserClient()
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
    <div className="flex min-h-screen items-center justify-center bg-background px-8">
      <div className="w-full max-w-[360px]">
        <h2
          className="text-4xl font-black italic uppercase leading-tight text-foreground"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Crear cuenta
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresá tu email y contraseña para registrarte.
        </p>

        <div
          className="my-6 h-px w-12"
          style={{ background: 'linear-gradient(90deg, oklch(0.88 0.09 88 / 0.9), oklch(0.48 0.10 65 / 0.3))' }}
        />

        <form onSubmit={handleRegister} className="space-y-4">
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

          <Button type="submit" className="w-full h-11 font-semibold text-sm" disabled={loading}>
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
  )
}
