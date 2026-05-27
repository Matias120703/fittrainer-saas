'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard, Users, Dumbbell, MessageSquare,
  Calendar, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients',   label: 'Clientes',  icon: Users },
  { href: '/routines',  label: 'Rutinas',   icon: Dumbbell },
  { href: '/chat',      label: 'Chat',      icon: MessageSquare },
  { href: '/calendar',  label: 'Calendario',icon: Calendar },
]

const ease = [0.22, 1, 0.36, 1] as const

interface TrainerSidebarProps {
  trainerName: string
  trainerAvatar?: string | null
}

function NavLink({
  href, label, icon: Icon, collapsed, isActive,
}: {
  href: string; label: string; icon: React.ElementType; collapsed: boolean; isActive: boolean
}) {
  return (
    <motion.div whileHover={{ x: collapsed ? 0 : 2 }} whileTap={{ scale: 0.97 }}>
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={cn(
          'group flex items-center gap-3 py-2.5 text-[13px] font-medium transition-colors duration-150 border-l-2',
          collapsed ? 'md:justify-center md:px-0 px-5' : 'px-5',
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
        )}
        style={isActive ? { background: 'oklch(0.72 0.14 82 / 0.07)' } : undefined}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-all duration-150',
            isActive ? 'text-primary' : 'text-muted-foreground/55 group-hover:text-foreground',
          )}
          style={isActive ? { filter: 'drop-shadow(0 0 5px oklch(0.72 0.14 82 / 0.7))' } : undefined}
        />
        <span className={cn('transition-all duration-200', collapsed && 'md:hidden')}>{label}</span>
      </Link>
    </motion.div>
  )
}

const SIDEBAR_W = 220
const COLLAPSED_W = 56

function SidebarContent({
  pathname, collapsed, setCollapsed, mobileOpen, setMobileOpen,
  trainerName, trainerAvatar, handleSignOut,
}: {
  pathname: string; collapsed: boolean; setCollapsed: (v: boolean) => void
  mobileOpen: boolean; setMobileOpen: (v: boolean) => void
  trainerName: string; trainerAvatar?: string | null
  handleSignOut: () => void
}) {
  const initials = trainerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className={cn(
        'flex items-center pt-6 pb-5 gap-3',
        collapsed ? 'md:flex-col md:px-0 md:items-center px-5 justify-between' : 'px-5 justify-between'
      )}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl dz-logo-glow overflow-hidden"
          style={{ background: 'linear-gradient(135deg, oklch(0.48 0.10 65) 0%, oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65) 100%)' }}
        >
          <span className="text-[13px] font-black leading-none" style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.08 0.006 65)' }}>DZ</span>
        </div>
        <div className={cn('min-w-0 flex-1 overflow-hidden transition-all duration-300', collapsed && 'md:hidden')}>
          <span className="block text-[13px] font-black uppercase tracking-widest leading-none text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>FitTrainer</span>
          <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground/45 mt-0.5">by Danny DZ</span>
        </div>
        <button
          onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors shrink-0"
        >
          {mobileOpen
            ? <X className="h-4 w-4" />
            : collapsed
              ? <ChevronRight className="h-4 w-4 hidden md:block" />
              : <ChevronLeft className="h-4 w-4 hidden md:block" />
          }
          <X className={cn('h-4 w-4 md:hidden', !mobileOpen && 'hidden')} />
        </button>
      </div>

      {/* Gold divider */}
      <div className={cn('mb-3 h-px', collapsed ? 'md:mx-auto md:w-8 bg-border' : 'mx-5')}
        style={!collapsed ? { background: 'linear-gradient(90deg, oklch(0.48 0.10 65 / 0.9), oklch(0.88 0.09 88 / 0.5), transparent)' } : undefined}
      />

      {/* Nav */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {!collapsed && (
          <p className="mb-1 px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/30 hidden md:block">
            Menú principal
          </p>
        )}
        {navItems.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <NavLink key={href} href={href} label={label} icon={icon} collapsed={collapsed} isActive={isActive} />
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border py-3">
        <NavLink
          href="/settings"
          label="Configuración"
          icon={Settings}
          collapsed={collapsed}
          isActive={pathname === '/settings'}
        />
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'group flex w-full items-center gap-3 py-2.5 text-[13px] font-medium border-l-2 border-transparent text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-all duration-150',
            collapsed ? 'md:justify-center md:px-0 px-5' : 'px-5'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground/55 group-hover:text-destructive transition-colors" />
          <span className={cn(collapsed && 'md:hidden')}>Cerrar sesión</span>
        </motion.button>

        <div className={cn(
          'mx-3 mt-3 flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5',
          collapsed && 'md:mx-auto md:w-10 md:justify-center md:px-0'
        )}>
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={trainerAvatar ?? undefined} />
            <AvatarFallback className="text-[10px] font-black" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88))', color: 'oklch(0.08 0.006 65)' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 flex-1', collapsed && 'md:hidden')}>
            <p className="truncate text-[12px] font-semibold text-foreground leading-tight">{trainerName}</p>
            <p className="text-[9px] uppercase tracking-wider font-medium leading-tight mt-0.5" style={{ color: 'oklch(0.72 0.14 82 / 0.65)' }}>Entrenador</p>
          </div>
          <div
            className={cn('h-1.5 w-1.5 shrink-0 rounded-full', collapsed && 'md:hidden')}
            style={{ background: 'oklch(0.72 0.14 82)', boxShadow: '0 0 6px oklch(0.72 0.14 82 / 0.8)' }}
          />
        </div>
      </div>
    </div>
  )
}

export function TrainerSidebar({ trainerName, trainerAvatar }: TrainerSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut()
    router.push('/login')
  }

  const sidebarBg = 'oklch(0.055 0.007 65)'

  return (
    <>
      {/* ── Mobile hamburger ── */}
      <AnimatePresence>
        {!mobileOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMobileOpen(true)}
            className="fixed top-3 left-3 z-50 md:hidden flex items-center justify-center rounded-xl border border-white/[0.07] bg-card/90 p-2 shadow-lg backdrop-blur-sm"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Mobile drawer (overlay) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -SIDEBAR_W }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W }}
              transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.8 }}
              className="fixed inset-y-0 left-0 z-50 w-[220px] md:hidden shadow-2xl"
              style={{ background: sidebarBg, borderRight: '1px solid oklch(0.17 0.007 65)' }}
            >
              <SidebarContent
                pathname={pathname}
                collapsed={false}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                trainerName={trainerName}
                trainerAvatar={trainerAvatar}
                handleSignOut={handleSignOut}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar (always in-flow) ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full shrink-0 border-r border-sidebar-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-[56px]' : `w-[${SIDEBAR_W}px]`,
        )}
        style={{ background: sidebarBg, width: collapsed ? COLLAPSED_W : SIDEBAR_W }}
      >
        <SidebarContent
          pathname={pathname}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={false}
          setMobileOpen={() => {}}
          trainerName={trainerName}
          trainerAvatar={trainerAvatar}
          handleSignOut={handleSignOut}
        />
      </aside>
    </>
  )
}
