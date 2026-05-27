'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Dumbbell, TrendingUp, MessageSquare, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/home',        label: 'Inicio',     icon: Home },
  { href: '/routine',     label: 'Rutina',     icon: Dumbbell },
  { href: '/progress',    label: 'Progreso',   icon: TrendingUp },
  { href: '/messages',    label: 'Chat',       icon: MessageSquare },
  { href: '/my-calendar', label: 'Agenda',     icon: Calendar },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      style={{
        background: 'oklch(0.07 0.008 65 / 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid oklch(0.94 0.006 75 / 0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 pb-safe-area-inset-bottom">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 px-3 py-3 min-w-0"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -inset-1.5 rounded-xl"
                    style={{ background: 'oklch(0.72 0.14 82 / 0.12)' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                  />
                )}
                <Icon
                  className={cn(
                    'relative h-5 w-5 transition-colors duration-200',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  style={isActive ? {
                    filter: 'drop-shadow(0 0 6px oklch(0.72 0.14 82 / 0.6))',
                  } : undefined}
                />
              </div>
              <span
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-wider transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground/60'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
