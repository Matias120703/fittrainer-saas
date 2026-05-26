'use client'

import { useState, useMemo } from 'react'
import { ProgressChart } from './ProgressChart'
import { Calendar, Dumbbell, X } from 'lucide-react'
import { format, isWithinInterval, parseISO, startOfDay, endOfDay, eachDayOfInterval, isToday, isThisWeek } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ProgressRecord {
  id: string
  recorded_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  notes?: string | null
}

export interface WorkoutLogItem {
  id: string
  completed_at: string
  duration_minutes?: number | null
}

interface ProgressSectionProps {
  records: ProgressRecord[]
  workoutLogs: WorkoutLogItem[]
}

const GOLD = 'oklch(0.70 0.14 82)'

export function ProgressSection({ records, workoutLogs }: ProgressSectionProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')

  const filtered = useMemo(() => {
    if (!startDate && !endDate) return records
    return records.filter((r) => {
      const date = parseISO(r.recorded_at)
      if (startDate && endDate) {
        return isWithinInterval(date, { start: startOfDay(parseISO(startDate)), end: endOfDay(parseISO(endDate)) })
      }
      if (startDate) return date >= startOfDay(parseISO(startDate))
      if (endDate)   return date <= endOfDay(parseISO(endDate))
      return true
    })
  }, [records, startDate, endDate])

  const filteredLogs = useMemo(() => {
    if (!startDate && !endDate) return workoutLogs
    return workoutLogs.filter((l) => {
      const date = parseISO(l.completed_at)
      if (startDate && endDate) {
        return isWithinInterval(date, { start: startOfDay(parseISO(startDate)), end: endOfDay(parseISO(endDate)) })
      }
      if (startDate) return date >= startOfDay(parseISO(startDate))
      if (endDate)   return date <= endOfDay(parseISO(endDate))
      return true
    })
  }, [workoutLogs, startDate, endDate])

  const clearFilter = () => { setStartDate(''); setEndDate('') }
  const hasFilter = startDate || endDate

  // Training days this week
  const thisWeekLogs = workoutLogs.filter((l) => isThisWeek(parseISO(l.completed_at), { weekStartsOn: 1 }))
  const weekDays = eachDayOfInterval({
    start: (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d })(),
    end:   (() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 6); return d })(),
  })

  const trainedDates = new Set(workoutLogs.map((l) => l.completed_at.slice(0, 10)))
  const thisWeekTrainedCount = thisWeekLogs.length
  const totalSessions = filteredLogs.length

  return (
    <div className="space-y-4">
      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none w-28"
            style={{ colorScheme: 'dark' }}
            placeholder="Desde"
          />
        </div>
        <span className="text-xs text-muted-foreground">—</span>
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-xs text-foreground focus:outline-none w-28"
            style={{ colorScheme: 'dark' }}
            placeholder="Hasta"
          />
        </div>
        {hasFilter && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-1 rounded-lg border border-border/50 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}
        {hasFilter && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-4">
        <ProgressChart records={filtered} />
      </div>

      {/* Training days */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
            <span className="text-sm font-medium" style={{ color: 'oklch(0.94 0.006 75)' }}>
              Días entrenados
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black" style={{ color: GOLD }}>{totalSessions}</span>
            <span className="text-xs text-muted-foreground ml-1">
              sesión{totalSessions !== 1 ? 'es' : ''}{hasFilter ? ' en período' : ' en total'}
            </span>
          </div>
        </div>

        {/* This week strip */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-2">Esta semana</p>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const trained = trainedDates.has(key)
              const today = isToday(day)
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] uppercase tracking-wide text-muted-foreground/40">
                    {format(day, 'EEE', { locale: es }).slice(0, 2)}
                  </span>
                  <div
                    className="h-7 w-full rounded-md flex items-center justify-center transition-all duration-300"
                    style={{
                      background: trained
                        ? 'oklch(0.70 0.14 82 / 0.2)'
                        : today
                        ? 'oklch(0.16 0.007 65)'
                        : 'oklch(0.12 0.007 65)',
                      border: trained
                        ? '1px solid oklch(0.70 0.14 82 / 0.5)'
                        : today
                        ? '1px solid oklch(0.28 0.008 68)'
                        : '1px solid oklch(0.18 0.007 65)',
                    }}
                  >
                    {trained && (
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 4px ${GOLD}` }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted-foreground text-center">
            {thisWeekTrainedCount === 0
              ? 'Sin entrenamientos esta semana'
              : `${thisWeekTrainedCount} día${thisWeekTrainedCount !== 1 ? 's' : ''} entrenado${thisWeekTrainedCount !== 1 ? 's' : ''} esta semana`}
          </p>
        </div>
      </div>
    </div>
  )
}
