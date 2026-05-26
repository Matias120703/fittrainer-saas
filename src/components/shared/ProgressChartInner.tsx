'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TrendingUp } from 'lucide-react'

interface ProgressRecord {
  id: string
  recorded_at: string
  weight_kg: number | null
  body_fat_pct: number | null
}

const gold = 'oklch(0.70 0.14 82)'
const teal = 'oklch(0.65 0.16 175)'

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: 'oklch(0.12 0.007 65)', borderColor: 'oklch(0.21 0.008 68)' }}
    >
      <p className="mb-1.5 font-semibold" style={{ color: 'oklch(0.94 0.006 75)' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'weight_kg' ? 'Peso' : 'Grasa'}:{' '}
          <strong>{entry.value}{entry.name === 'weight_kg' ? ' kg' : '%'}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ProgressChartInner({ records }: { records: ProgressRecord[] }) {
  const data = records.map((r) => ({
    date: format(new Date(r.recorded_at), 'd MMM', { locale: es }),
    weight_kg: r.weight_kg ?? undefined,
    body_fat_pct: r.body_fat_pct ?? undefined,
  }))

  const hasWeight = records.some((r) => r.weight_kg != null)
  const hasFat = records.some((r) => r.body_fat_pct != null)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 shrink-0" style={{ color: gold }} />
        <span className="text-sm font-medium" style={{ color: 'oklch(0.94 0.006 75)' }}>
          Evolución del progreso
        </span>
      </div>
      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gold} stopOpacity={0.25} />
                <stop offset="95%" stopColor={gold} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={teal} stopOpacity={0.25} />
                <stop offset="95%" stopColor={teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.21 0.008 68)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'oklch(0.52 0.010 72)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'oklch(0.52 0.010 72)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {hasWeight && hasFat && (
              <Legend
                iconType="circle"
                iconSize={6}
                formatter={(value) => (
                  <span style={{ color: 'oklch(0.52 0.010 72)', fontSize: 10 }}>
                    {value === 'weight_kg' ? 'Peso (kg)' : 'Grasa (%)'}
                  </span>
                )}
              />
            )}
            {hasWeight && (
              <Area
                type="monotone"
                dataKey="weight_kg"
                stroke={gold}
                strokeWidth={2.5}
                fill="url(#gradWeight)"
                dot={{ r: 3.5, fill: gold, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: gold, strokeWidth: 2, stroke: 'oklch(0.12 0.007 65)' }}
                connectNulls
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
                animationBegin={0}
              />
            )}
            {hasFat && (
              <Area
                type="monotone"
                dataKey="body_fat_pct"
                stroke={teal}
                strokeWidth={2.5}
                fill="url(#gradFat)"
                dot={{ r: 3.5, fill: teal, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: teal, strokeWidth: 2, stroke: 'oklch(0.12 0.007 65)' }}
                connectNulls
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
                animationBegin={200}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
