'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Dumbbell, TrendingUp, MessageSquare, Calendar, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/home',        label: 'Inicio',      icon: Home },
  { href: '/routine',     label: 'Mi Rutina',   icon: Dumbbell },
  { href: '/progress',    label: 'Progreso',    icon: TrendingUp },
  { href: '/messages',    label: 'Chat',        icon: MessageSquare },
  { href: '/my-calendar', label: 'Calendario',  icon: Calendar },
]

interface ClientSidebarProps {
  clientName: string
  clientAvatar?: string | null
}

export function ClientSidebar({ clientName, clientAvatar }: ClientSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = clientName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* Mobile: backdrop */}
      <div
        className={cn('fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300', mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile: hamburger trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn('fixed top-3 left-3 z-50 md:hidden flex items-center justify-center rounded-lg border border-border bg-card p-2 shadow-lg transition-opacity duration-200', mobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100')}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
          'fixed inset-y-0 left-0 z-50 w-[220px] shadow-2xl',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:inset-auto md:z-auto md:shadow-none md:translate-x-0 md:h-full md:shrink-0',
          collapsed ? 'md:w-[56px]' : 'md:w-[220px]',
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center pt-6 pb-5 gap-3', collapsed ? 'md:flex-col md:px-0 md:items-center' : 'px-5 justify-between')}>
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md overflow-hidden"
            style={{ background: 'linear-gradient(135deg, oklch(0.48 0.10 65) 0%, oklch(0.88 0.09 88) 50%, oklch(0.48 0.10 65) 100%)' }}
          >
            <span className="text-[13px] font-black leading-none tracking-tighter" style={{ fontFamily: 'var(--font-heading)', color: 'oklch(0.10 0.006 65)' }}>DZ</span>
          </div>

          <div className={cn('min-w-0 flex-1 transition-all duration-300 overflow-hidden', collapsed && 'md:hidden')}>
            <span className="block text-[14px] font-black uppercase tracking-widest leading-none text-gold-gradient" style={{ fontFamily: 'var(--font-heading)' }}>FitTrainer</span>
            <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground/50 mt-0.5">by Danny DZ</span>
          </div>

          <button
            onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(!collapsed)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0"
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <span className="md:hidden"><X className="h-4 w-4" /></span>
            <span className={cn('hidden md:block', collapsed ? '' : '')}>{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</span>
          </button>
        </div>

        {/* Separador */}
        <div className={cn('mb-3 h-px', collapsed ? 'md:mx-auto md:w-8 bg-border' : 'mx-5')}
          style={!collapsed ? { background: 'linear-gradient(90deg, oklch(0.48 0.10 65 / 0.8), oklch(0.88 0.09 88 / 0.5), transparent)' } : undefined}
        />

        {/* Nav */}
        <nav className="flex-1 py-1">
          {!collapsed && <p className="mb-1 px-5 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/35 hidden md:block">Mi zona</p>}
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} title={collapsed ? label : undefined}
                className={cn('group flex items-center gap-3 py-2.5 text-[13px] font-medium transition-all duration-150 border-l-2',
                  collapsed ? 'md:justify-center md:pl-0 md:pr-0 pl-5 pr-4' : 'pl-5 pr-4',
                  isActive ? 'border-primary bg-primary/[0.08] text-primary' : 'border-transparent text-muted-foreground hover:border-border hover:bg-white/[0.03] hover:text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-foreground')} />
                <span className={cn(collapsed && 'md:hidden')}>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-sidebar-border py-3">
          <button onClick={handleSignOut} title={collapsed ? 'Cerrar sesión' : undefined}
            className={cn('group flex w-full items-center gap-3 py-2.5 text-[13px] font-medium border-l-2 border-transparent text-muted-foreground hover:border-destructive/40 hover:bg-destructive/[0.06] hover:text-destructive transition-all duration-150',
              collapsed ? 'md:justify-center md:pl-0 md:pr-0 pl-5 pr-4' : 'pl-5 pr-4',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-destructive" />
            <span className={cn(collapsed && 'md:hidden')}>Cerrar sesión</span>
          </button>

          <div className={cn('mx-3 mt-2 flex items-center gap-3 rounded-md border border-border/40 bg-background/50 px-3 py-2.5', collapsed && 'md:mx-auto md:w-10 md:justify-center md:px-0')}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={clientAvatar ?? undefined} />
              <AvatarFallback className="text-[10px] font-black" style={{ fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, oklch(0.48 0.10 65), oklch(0.88 0.09 88))', color: 'oklch(0.10 0.006 65)' }}>{initials}</AvatarFallback>
            </Avatar>
            <div className={cn('min-w-0 flex-1', collapsed && 'md:hidden')}>
              <p className="truncate text-[12px] font-semibold text-foreground leading-tight">{clientName}</p>
              <p className="text-[9px] uppercase tracking-wider text-primary/60 font-medium leading-tight mt-0.5">Atleta</p>
            </div>
            <div className={cn('h-1.5 w-1.5 shrink-0 rounded-full', collapsed && 'md:hidden')} style={{ background: 'oklch(0.70 0.14 82)', boxShadow: '0 0 6px oklch(0.70 0.14 82 / 0.7)' }} />
          </div>
        </div>
      </aside>
    </>
  )
}
