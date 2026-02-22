'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface CompetitivenessIndicatorProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function CompetitivenessIndicator({ score, showLabel = true, size = 'md' }: CompetitivenessIndicatorProps) {
  const t = useTranslations('performance')

  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 70 ? 'text-emerald-700' : score >= 40 ? 'text-amber-700' : 'text-red-700'
  const bgColor = score >= 70 ? 'bg-emerald-50' : score >= 40 ? 'bg-amber-50' : 'bg-red-50'
  const label = score >= 70 ? t('competitive') : score >= 40 ? t('average') : t('uncompetitive')

  return (
    <div className="flex flex-col gap-1">
      <div className={cn('w-full rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2', 'bg-slate-200')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', textColor, bgColor)}>{label}</span>
          <span className="text-xs text-slate-500 font-mono">{score}%</span>
        </div>
      )}
    </div>
  )
}
