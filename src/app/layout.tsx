import type { Metadata } from 'next'
import { Barlow_Condensed, DM_Sans } from 'next/font/google'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'FitTrainer — Plataforma para entrenadores',
  description: 'Gestiona tus clientes, rutinas, progreso y pagos en un solo lugar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${barlowCondensed.variable} ${dmSans.variable} h-full dark`}
      suppressHydrationWarning
    >
      <body className="h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
