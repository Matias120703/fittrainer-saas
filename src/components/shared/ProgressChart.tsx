'use client'

import dynamic from 'next/dynamic'
import { TrendingUp } from 'lucide-react'

interface ProgressRecord {
  id: string
  recorded_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  notes?: string | null
}

interface ProgressChartProps {
  records: ProgressRecord[]
}

const ProgressChartInner = dynamic(() => import('./ProgressChartInner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[180px]">
      <div className="h-1 w-24 rounded-full bg-border animate-pulse" />
    </div>
  ),
})

export function ProgressChart({ records }: ProgressChartProps) {
  const sorted = [...records]
    .filter((r) => r.weight_kg != null || r.body_fat_pct != null)
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))

  if (sorted.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <TrendingUp className="h-8 w-8 mb-2" style={{ color: 'oklch(0.70 0.14 82 / 0.4)' }} />
        <p className="text-sm" style={{ color: 'oklch(0.52 0.010 72)' }}>
          Se necesitan al menos 2 registros para mostrar el gráfico
        </p>
      </div>
    )
  }

  return <ProgressChartInner records={sorted} />
}
