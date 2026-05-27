'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Home, Dumbbell, TrendingUp, MessageSquare, Calendar, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/home',        label: 'Inicio',     icon: Home },
  { href: '/routine',     label: 'Mi Rutina',  icon: Dumbbell },
  { href: '/progress',    label: 'Progreso',   icon: TrendingUp },
  { href: '/messages',    label: 'Chat',       icon: MessageSquare },
  { href: '/my-calendar', label: 'Calendario', icon: Calendar },
]

interface ClientSidebarProps {
  clientName: string
  clientAvatar?: string | null
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
          collapsed ? 'justify-center px-0' : 'px-5',
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
        )}
        style={isActive ? { background: 'oklch(0.72 0.14 82 / 0.07)' } : undefined}
      >
        <Icon
          className={cn('h-4 w-4 shrink-0 transition-colors duration-150', isActive ? 'text-primary' : 'text-muted-foreground/55 group-hover:text-foreground')}
          style={isActive ? { filter: 'drop-shadow(0 0 5px oklch(0.72 0.14 82 / 0.7))' } : undefined}
        />
        <span className={cn('transition-all duration-200', collapsed && 'hidden')}>{label}</span>
      </Link>
    </motion.div>
  )
}

export function ClientSidebar({ clientName, clientAvatar }: ClientSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const initials = clientName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  async function handleSignOut() {
    await getSupabaseClient().auth.signOut()
    router.push('/login')
  }

  const sidebarBg = 'oklch(0.055 0.007 65)'

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full shrink-0 border-r border-sidebar-border transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
      )}
      style={{ background: sidebarBg, width: collapsed ? 56 : 220 }}
    >
      {/* Header */}
      <div className={cn('flex items-center pt-6 pb-5 gap-3', collapsed ? 'flex-col px-0 items-center' : 'px-5 justify-between')}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl dz-logo-glow overflow-hidden"
          style={{ background: 'linear-gradient(135deg, oklch(0.48 0.10 65) 0%, oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65) 100%)' }}
        >
          <span className="text-[13px] font-black leading-none" style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.08 0.006 65)' }}>DZ</span>
        </div>
        <div className={cn('min-w-0 flex-1 overflow-hidden', collapsed && 'hidden')}>
          <span className="block text-[13px] font-black uppercase tracking-widest leading-none text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>FitTrainer</span>
          <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground/45 mt-0.5">by Danny DZ</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Gold divider */}
      <div className={cn('mb-3 h-px', collapsed ? 'mx-auto w-8 bg-border' : 'mx-5')}
        style={!collapsed ? { background: 'linear-gradient(90deg, oklch(0.48 0.10 65 / 0.9), oklch(0.88 0.09 88 / 0.5), transparent)' } : undefined}
      />

      {/* Nav */}
      <nav className="flex-1 py-1 overflow-y-auto">
        {!collapsed && (
          <p className="mb-1 px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/30">Mi zona</p>
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
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'group flex w-full items-center gap-3 py-2.5 text-[13px] font-medium border-l-2 border-transparent text-muted-foreground hover:border-destructive/40 hover:text-destructive transition-all duration-150',
            collapsed ? 'justify-center px-0' : 'px-5'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground/55 group-hover:text-destructive transition-colors" />
          <span className={cn(collapsed && 'hidden')}>Cerrar sesión</span>
        </motion.button>

        <div className={cn('mx-3 mt-3 flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5', collapsed && 'mx-auto w-10 justify-center px-0')}>
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={clientAvatar ?? undefined} />
            <AvatarFallback className="text-[10px] font-black" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88))', color: 'oklch(0.08 0.006 65)' }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={cn('min-w-0 flex-1', collapsed && 'hidden')}>
            <p className="truncate text-[12px] font-semibold text-foreground leading-tight">{clientName}</p>
            <p className="text-[9px] uppercase tracking-wider font-medium leading-tight mt-0.5" style={{ color: 'oklch(0.72 0.14 82 / 0.65)' }}>Atleta</p>
          </div>
          <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', collapsed && 'hidden')}
            style={{ background: 'oklch(0.72 0.14 82)', boxShadow: '0 0 6px oklch(0.72 0.14 82 / 0.8)' }}
          />
        </div>
      </div>
    </aside>
  )
}

// Dummy AnimatePresence re-export to satisfy Framer Motion usage in file
export { AnimatePresence }
