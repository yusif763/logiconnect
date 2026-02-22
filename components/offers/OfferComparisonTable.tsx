'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { CheckCircle, XCircle, Loader2, Building2, Plane, Ship, Train, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

const transportIcons: Record<string, any> = {
  AIR: Plane, SEA: Ship, RAIL: Train, ROAD: Truck,
}

interface OfferComparisonTableProps {
  offers: any[]
  isOwner: boolean
  announcementStatus: string
  onOfferUpdate: (offerId: string, status: string) => Promise<void>
}

export function OfferComparisonTable({
  offers,
  isOwner,
  announcementStatus,
  onOfferUpdate,
}: OfferComparisonTableProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  if (offers.length === 0) {
    return (
      <p className="text-center text-slate-500 py-8">No offers to compare yet.</p>
    )
  }

  // Compute per-offer best price and delivery days (pick lowest price item per offer)
  const offerSummaries = offers.map((offer) => {
    const items: any[] = offer.items ?? []
    const minPrice = items.length > 0 ? Math.min(...items.map((i: any) => i.price)) : Infinity
    const minDays = items.length > 0 ? Math.min(...items.map((i: any) => i.deliveryDays)) : Infinity
    return { ...offer, minPrice, minDays }
  })

  const allPrices = offerSummaries.map((o) => o.minPrice).filter(isFinite)
  const allDays = offerSummaries.map((o) => o.minDays).filter(isFinite)
  const priceMin = Math.min(...allPrices)
  const priceMax = Math.max(...allPrices)
  const daysMin = Math.min(...allDays)

  // Score: 1 - (price - min) / (max - min), clamped
  const scored = offerSummaries.map((offer) => {
    const score =
      priceMax > priceMin
        ? Math.round((1 - (offer.minPrice - priceMin) / (priceMax - priceMin)) * 100)
        : 100
    return { ...offer, score }
  })

  const bestScore = Math.max(...scored.map((o) => o.score))
  const recommended = scored.find((o) => o.score === bestScore)

  const handleUpdate = async (offerId: string, status: string) => {
    setUpdating(offerId)
    await onOfferUpdate(offerId, status)
    setUpdating(null)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="text-left px-4 py-3 font-medium text-slate-600">Company</th>
            <th className="text-left px-4 py-3 font-medium text-slate-600">Transport Types</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Best Price</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Fastest</th>
            <th className="text-right px-4 py-3 font-medium text-slate-600">Score</th>
            <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
            {isOwner && announcementStatus === 'ACTIVE' && (
              <th className="text-center px-4 py-3 font-medium text-slate-600">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {scored.map((offer) => {
            const isBestValue = offer.minPrice === priceMin
            const isFastest = offer.minDays === daysMin
            const isRecommended = offer.id === recommended?.id
            const items: any[] = offer.items ?? []

            return (
              <tr
                key={offer.id}
                className={cn(
                  'border-b last:border-0 transition-colors',
                  isRecommended ? 'bg-blue-50' : 'hover:bg-slate-50'
                )}
              >
                {/* Company */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900">
                      {offer.logisticsCompany?.name}
                    </span>
                  </div>
                  {offer.notes && (
                    <p className="text-xs text-slate-400 italic mt-0.5 line-clamp-1">
                      {offer.notes}
                    </p>
                  )}
                </td>

                {/* Transport types */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {items.map((item: any, idx: number) => {
                      const Icon = transportIcons[item.transportType] || Truck
                      return (
                        <span
                          key={idx}
                          className="flex items-center gap-1 text-xs bg-slate-100 rounded px-2 py-0.5"
                        >
                          <Icon className="h-3 w-3" />
                          {item.transportType}
                        </span>
                      )
                    })}
                  </div>
                </td>

                {/* Best price */}
                <td className="px-4 py-3 text-right">
                  <div className="font-semibold text-slate-900">
                    ${offer.minPrice.toLocaleString()}
                  </div>
                  {isBestValue && (
                    <Badge className="text-xs bg-green-100 text-green-700 mt-0.5">Best Value</Badge>
                  )}
                </td>

                {/* Fastest */}
                <td className="px-4 py-3 text-right">
                  <span className="text-slate-700">{offer.minDays}d</span>
                  {isFastest && (
                    <div>
                      <Badge className="text-xs bg-purple-100 text-purple-700 mt-0.5">Fastest</Badge>
                    </div>
                  )}
                </td>

                {/* Score */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${offer.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{offer.score}</span>
                  </div>
                  {isRecommended && (
                    <Badge className="text-xs bg-blue-100 text-blue-700 mt-0.5 float-right">
                      Recommended
                    </Badge>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  <OfferStatusBadge status={offer.status} label={offer.status} />
                </td>

                {/* Actions */}
                {isOwner && announcementStatus === 'ACTIVE' && (
                  <td className="px-4 py-3 text-center">
                    {offer.status === 'PENDING' ? (
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-7 px-2"
                          onClick={() => handleUpdate(offer.id, 'ACCEPTED')}
                          disabled={!!updating}
                        >
                          {updating === offer.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 h-7 px-2"
                          onClick={() => handleUpdate(offer.id, 'REJECTED')}
                          disabled={!!updating}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
