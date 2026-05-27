'use client'

import { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Bell, LogOut, AtSign, Globe, Dumbbell, ChevronRight,
  Check, X, Eye, EyeOff, Camera, Sparkles, Shield, Palette, Save,
  AlertTriangle, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import { updateProfile, updateTrainerProfile, updatePassword } from '@/lib/actions/settings'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ── Types ────────────────────────────────────────────────
interface Profile {
  full_name: string
  avatar_url: string | null
  role: string
}
interface TrainerData {
  bio: string | null
  specialties: string[] | null
  instagram_url: string | null
  website_url: string | null
}
interface Props {
  profile: Profile
  trainer: TrainerData | null
  email: string
}

// ── Animation config ──────────────────────────────────────
const ease = [0.22, 1, 0.36, 1] as const
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease },
  }),
}

// ── Toggle component ──────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors duration-300',
        checked ? 'bg-primary' : 'bg-white/10'
      )}
      style={checked ? { boxShadow: '0 0 10px oklch(0.72 0.14 82 / 0.5)' } : undefined}
    >
      <motion.div
        layout
        transition={{ type: 'spring', damping: 22, stiffness: 400 }}
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  )
}

// ── Section card ──────────────────────────────────────────
function SettingsCard({
  children, className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-white/[0.06] overflow-hidden', className)}
      style={{
        background: 'oklch(0.11 0.007 65 / 0.85)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {children}
    </div>
  )
}

function CardHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'oklch(0.72 0.14 82 / 0.12)' }}>
        <Icon className="h-3.5 w-3.5 text-primary" style={{ filter: 'drop-shadow(0 0 4px oklch(0.72 0.14 82 / 0.6))' }} />
      </div>
      <span className="text-[13px] font-semibold text-foreground">{label}</span>
    </div>
  )
}

function SettingsRow({
  icon: Icon, label, description, children, danger,
}: {
  icon?: React.ElementType
  label: string
  description?: string
  children?: React.ReactNode
  danger?: boolean
}) {
  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-4 transition-colors duration-150',
      !children ? '' : ''
    )}>
      {Icon && (
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', danger ? 'bg-destructive/10' : 'bg-white/[0.04]')}>
          <Icon className={cn('h-4 w-4', danger ? 'text-destructive' : 'text-muted-foreground')} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-[13px] font-medium', danger ? 'text-destructive' : 'text-foreground')}>{label}</p>
        {description && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}

// ── Inline editable field ─────────────────────────────────
function EditableField({
  label, name, defaultValue, placeholder, type = 'text', readOnly,
}: {
  label: string; name: string; defaultValue?: string; placeholder?: string
  type?: string; readOnly?: boolean
}) {
  return (
    <div className="px-5 py-3.5 space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">{label}</label>
      <Input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          'h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-sm focus-visible:ring-primary/50 transition-all',
          readOnly && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  )
}

// ── Inline status feedback ────────────────────────────────
function StatusMsg({ ok, msg }: { ok: boolean; msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        'mx-5 mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm',
        ok
          ? 'bg-emerald-400/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-destructive/10 border border-destructive/20 text-destructive'
      )}
    >
      {ok ? <Check className="h-4 w-4 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
      {msg}
    </motion.div>
  )
}

// ── Main component ────────────────────────────────────────
export function SettingsClient({ profile, trainer, email }: Props) {
  const [isPending, startTransition] = useTransition()
  const [notifications, setNotifications] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const [profileStatus, setProfileStatus]         = useState<{ ok: boolean; msg: string } | null>(null)
  const [trainerStatus, setTrainerStatus]         = useState<{ ok: boolean; msg: string } | null>(null)
  const [passwordStatus, setPasswordStatus]       = useState<{ ok: boolean; msg: string } | null>(null)

  const profileFormRef  = useRef<HTMLFormElement>(null)
  const trainerFormRef  = useRef<HTMLFormElement>(null)
  const passwordFormRef = useRef<HTMLFormElement>(null)

  const initials = profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  function handleProfile(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfile(formData)
      setProfileStatus(res.error ? { ok: false, msg: res.error } : { ok: true, msg: 'Perfil actualizado.' })
      setTimeout(() => setProfileStatus(null), 3500)
    })
  }

  function handleTrainer(formData: FormData) {
    startTransition(async () => {
      const res = await updateTrainerProfile(formData)
      setTrainerStatus(res.error ? { ok: false, msg: res.error } : { ok: true, msg: 'Perfil de entrenador guardado.' })
      setTimeout(() => setTrainerStatus(null), 3500)
    })
  }

  function handlePassword(formData: FormData) {
    startTransition(async () => {
      const res = await updatePassword(formData)
      if (res.error) {
        setPasswordStatus({ ok: false, msg: res.error })
      } else {
        setPasswordStatus({ ok: true, msg: 'Contraseña actualizada correctamente.' })
        passwordFormRef.current?.reset()
      }
      setTimeout(() => setPasswordStatus(null), 3500)
    })
  }

  async function handleLogout() {
    await getSupabaseClient().auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="px-5 py-7 lg:px-8 lg:py-8 pb-24 md:pb-8 max-w-2xl mx-auto space-y-5">

      {/* ── Page heading ── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="show">
        <h1
          className="text-[32px] font-black italic uppercase leading-tight text-gold-gradient"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Configuración
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestioná tu perfil y preferencias.</p>
      </motion.div>

      {/* ── Profile hero ── */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <div
            className="relative h-24 w-full overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, oklch(0.055 0.007 65) 0%, oklch(0.13 0.012 80 / 0.6) 100%)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, oklch(0.72 0.14 82 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.72 0.14 82 / 0.04) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <div
              className="absolute bottom-0 right-0 h-40 w-40 translate-x-1/4 translate-y-1/4 rounded-full blur-[60px] pointer-events-none"
              style={{ background: 'oklch(0.72 0.14 82 / 0.15)' }}
            />
          </div>

          <div className="px-5 pb-5 -mt-10 flex items-end gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-4" style={{ ringColor: 'oklch(0.055 0.007 65)' } as React.CSSProperties}>
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback
                  className="text-xl font-black"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88))',
                    color: 'oklch(0.08 0.006 65)',
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1]"
                style={{ background: 'oklch(0.15 0.007 65)' }}
                title="Cambiar avatar (próximamente)"
              >
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="pb-1 min-w-0">
              <p className="text-[18px] font-bold text-foreground leading-tight truncate">{profile.full_name}</p>
              <p className="text-[12px] text-muted-foreground/70 truncate">{email}</p>
              <div
                className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'oklch(0.72 0.14 82 / 0.12)', color: 'oklch(0.72 0.14 82)' }}
              >
                <Sparkles className="h-3 w-3" />
                Entrenador
              </div>
            </div>
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Profile form ── */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <CardHeader icon={User} label="Perfil personal" />
          <form ref={profileFormRef} action={handleProfile}>
            <EditableField label="Nombre completo" name="full_name" defaultValue={profile.full_name} placeholder="Tu nombre" />
            <EditableField label="Email" name="email" defaultValue={email} readOnly />
            <AnimatePresence>
              {profileStatus && <StatusMsg ok={profileStatus.ok} msg={profileStatus.msg} />}
            </AnimatePresence>
            <div className="px-5 pb-5">
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px oklch(0.72 0.14 82 / 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.52 0.11 70) 0%, oklch(0.80 0.14 88) 50%, oklch(0.52 0.11 70) 100%)',
                  color: 'oklch(0.08 0.006 65)',
                }}
              >
                <Save className="h-3.5 w-3.5" />
                {isPending ? 'Guardando…' : 'Guardar cambios'}
              </motion.button>
            </div>
          </form>
        </SettingsCard>
      </motion.div>

      {/* ── Trainer profile ── */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <CardHeader icon={Dumbbell} label="Perfil de entrenador" />
          <form ref={trainerFormRef} action={handleTrainer}>
            <div className="px-5 py-3.5 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Bio</label>
              <textarea
                name="bio"
                defaultValue={trainer?.bio ?? ''}
                placeholder="Contá tu historia, especialidades, metodología..."
                rows={3}
                className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all"
              />
            </div>
            <EditableField
              label="Especialidades (separadas por coma)"
              name="specialties"
              defaultValue={trainer?.specialties?.join(', ') ?? ''}
              placeholder="Musculación, Pérdida de peso, Funcional"
            />
            <div className="px-5 pb-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70 flex items-center gap-1.5">
                  <AtSign className="h-3 w-3" /> Instagram
                </label>
                <Input
                  name="instagram_url"
                  defaultValue={trainer?.instagram_url ?? ''}
                  placeholder="https://instagram.com/usuario"
                  className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-sm focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70 flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Sitio web
                </label>
                <Input
                  name="website_url"
                  defaultValue={trainer?.website_url ?? ''}
                  placeholder="https://tusitio.com"
                  className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-sm focus-visible:ring-primary/50"
                />
              </div>
            </div>
            <AnimatePresence>
              {trainerStatus && <StatusMsg ok={trainerStatus.ok} msg={trainerStatus.msg} />}
            </AnimatePresence>
            <div className="px-5 pb-5">
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px oklch(0.72 0.14 82 / 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.52 0.11 70) 0%, oklch(0.80 0.14 88) 50%, oklch(0.52 0.11 70) 100%)',
                  color: 'oklch(0.08 0.006 65)',
                }}
              >
                <Save className="h-3.5 w-3.5" />
                {isPending ? 'Guardando…' : 'Guardar perfil'}
              </motion.button>
            </div>
          </form>
        </SettingsCard>
      </motion.div>

      {/* ── Brand accent ── */}
      <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <CardHeader icon={Palette} label="Marca y diseño" />
          <div className="px-5 py-4 space-y-4">
            <p className="text-[12px] text-muted-foreground/70">Color de acento de tu marca. Tus clientes verán este color en su experiencia.</p>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Oro DZ',   color: 'oklch(0.72 0.14 82)', active: true },
                { label: 'Azul',     color: 'oklch(0.65 0.16 240)' },
                { label: 'Esmeralda', color: 'oklch(0.68 0.16 155)' },
                { label: 'Violeta',  color: 'oklch(0.65 0.18 290)' },
                { label: 'Rojo',     color: 'oklch(0.62 0.22 25)' },
              ].map(({ label, color, active }) => (
                <button
                  key={label}
                  title={label}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-transform duration-200 hover:scale-110',
                    active ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ background: color, boxShadow: active ? `0 0 12px ${color}` : undefined }}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">Personalización de colores — próximamente</p>
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Security ── */}
      <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <CardHeader icon={Shield} label="Seguridad" />
          <form ref={passwordFormRef} action={handlePassword}>
            <div className="px-5 py-3.5 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Nueva contraseña</label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-sm pr-10 focus-visible:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="px-5 pb-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">Confirmar contraseña</label>
              <Input
                name="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repetí la contraseña"
                className="h-10 rounded-xl bg-white/[0.03] border-white/[0.08] text-sm focus-visible:ring-primary/50"
              />
            </div>
            <AnimatePresence>
              {passwordStatus && <StatusMsg ok={passwordStatus.ok} msg={passwordStatus.msg} />}
            </AnimatePresence>
            <div className="px-5 pb-5">
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-[12px] font-semibold text-foreground/80 hover:text-foreground hover:bg-white/[0.07] transition-all disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                {isPending ? 'Actualizando…' : 'Cambiar contraseña'}
              </motion.button>
            </div>
          </form>
        </SettingsCard>
      </motion.div>

      {/* ── Preferences ── */}
      <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <CardHeader icon={Bell} label="Preferencias" />
          <div className="divide-y divide-white/[0.04]">
            <SettingsRow
              icon={Bell}
              label="Notificaciones"
              description="Alertas de nuevos mensajes y actividades"
            >
              <Toggle checked={notifications} onChange={setNotifications} />
            </SettingsRow>
            <SettingsRow
              icon={ExternalLink}
              label="Ver mi perfil público"
              description="Cómo te ven tus clientes"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            </SettingsRow>
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Danger zone ── */}
      <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="show">
        <SettingsCard>
          <CardHeader icon={AlertTriangle} label="Sesión" />
          <div className="p-5">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-between rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3.5 text-sm font-semibold text-destructive transition-all hover:bg-destructive/[0.10] hover:border-destructive/30"
            >
              <div className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </div>
              <ChevronRight className="h-4 w-4 opacity-60" />
            </motion.button>
          </div>
        </SettingsCard>
      </motion.div>

      {/* ── Footer ── */}
      <motion.p
        custom={8}
        variants={sectionVariants}
        initial="hidden"
        animate="show"
        className="text-center text-[10px] text-muted-foreground/30 uppercase tracking-widest pb-4"
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        FitTrainer · DZ Fitness Club · v1.0
      </motion.p>
    </div>
  )
}
