'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceInsightCardProps {
  transportType: string
  cargoType: string
  origin: string
  destination: string
  currentPrice: number
}

interface Insight {
  noData: boolean
  marketMin?: number
  marketMax?: number
  marketAverage?: number
  winningAverage?: number
  offersAnalyzed?: number
  winRate?: number
}

function winProbability(price: number, avg: number, min: number): number {
  if (price <= min) return 95
  if (price >= avg * 1.3) return 10
  const ratio = (avg - price) / (avg - min)
  return Math.round(Math.max(10, Math.min(95, 50 + ratio * 45)))
}

export function PriceInsightCard({
  transportType,
  cargoType,
  origin,
  destination,
  currentPrice,
}: PriceInsightCardProps) {
  const [insight, setInsight] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!transportType) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          transportType,
          cargoType,
          origin,
          destination,
        })
        const res = await fetch(`/api/price-insight?${params}`)
        const data = await res.json()
        setInsight(data)
      } catch {
        setInsight(null)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [transportType, cargoType, origin, destination, currentPrice])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Analyzing market prices...
      </div>
    )
  }

  if (!insight || insight.noData || !insight.marketMin || !insight.marketMax) {
    return (
      <p className="text-xs text-slate-400 py-1">
        No market data available for this route yet.
      </p>
    )
  }

  const { marketMin, marketMax, marketAverage, winningAverage, offersAnalyzed, winRate } = insight
  const hasPrice = currentPrice > 0

  const pct = marketMax > marketMin
    ? Math.min(100, Math.max(0, ((currentPrice - marketMin) / (marketMax - marketMin)) * 100))
    : 50

  const prob = hasPrice && marketAverage && marketMin
    ? winProbability(currentPrice, marketAverage, marketMin)
    : null

  const badge =
    !hasPrice ? null
    : currentPrice <= (marketAverage ?? 0) * 0.95 ? 'Competitive'
    : currentPrice <= (marketAverage ?? 0) * 1.1 ? 'Average'
    : 'Priced High'

  const badgeClass =
    badge === 'Competitive' ? 'bg-green-100 text-green-700'
    : badge === 'Average' ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'

  return (
    <Card className="border-blue-100 bg-blue-50/40">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Market Price Insight
          </div>
          <span className="text-xs text-slate-400">{offersAnalyzed} offers analyzed</span>
        </div>

        {/* Price range bar */}
        <div className="space-y-1">
          <div className="relative h-2 rounded-full bg-slate-200">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-green-400 to-red-400"
              style={{ width: '100%', opacity: 0.6 }}
            />
            {hasPrice && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow transition-all"
                style={{ left: `calc(${pct}% - 6px)` }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>${marketMin?.toLocaleString()}</span>
            <span className="text-slate-400">avg ${marketAverage?.toLocaleString()}</span>
            <span>${marketMax?.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-600">
            Winning bids averaged{' '}
            <span className="font-semibold text-slate-900">${winningAverage?.toLocaleString()}</span>
            {' '}· market win rate{' '}
            <span className="font-semibold text-slate-900">{winRate}%</span>
          </div>

          <div className="flex items-center gap-2">
            {badge && (
              <Badge className={cn('text-xs', badgeClass)}>{badge}</Badge>
            )}
            {prob !== null && (
              <span className="text-xs font-semibold text-blue-700">
                ~{prob}% win chance
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
