'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { CompetitivenessIndicator } from './CompetitivenessIndicator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Plane, Ship, Train, Truck } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const transportIcons: Record<string, any> = {
  AIR: Plane, SEA: Ship, RAIL: Train, ROAD: Truck,
}

interface OfferBreakdownItem {
  id: string
  announcementTitle: string
  date: string
  transportType: string
  myPrice: number
  currency: string
  marketMin: number
  marketMax: number
  acceptedPrice: number | null
  status: string
  competitiveness: number
}

interface OfferBreakdownTableProps {
  items: OfferBreakdownItem[]
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  ACCEPTED: { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  REJECTED: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
  PENDING: { icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
}

export function OfferBreakdownTable({ items }: OfferBreakdownTableProps) {
  const t = useTranslations('performance')
  const to = useTranslations('offers')

  if (items.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">{t('noData')}</p>
  }

  return (
    <ScrollArea className="w-full">
      <div className="min-w-[720px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Announcement</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Transport</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('myPrice')}</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('marketRange')}</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('acceptedPrice')}</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => {
              const Icon = transportIcons[item.transportType] || Truck
              const statusInfo = statusConfig[item.status] || statusConfig.PENDING
              const StatusIcon = statusInfo.icon
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-900 truncate max-w-[160px]">{item.announcementTitle}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {format(new Date(item.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-700">{to(`transport.${item.transportType}`)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-blue-700 font-mono">
                    {item.myPrice.toLocaleString()} {item.currency}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 text-xs font-mono whitespace-nowrap">
                    {item.marketMin.toLocaleString()} – {item.marketMax.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {item.acceptedPrice != null ? (
                      <span className="text-emerald-700 font-semibold">{item.acceptedPrice.toLocaleString()} {item.currency}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 min-w-[120px]">
                    <CompetitivenessIndicator score={item.competitiveness} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    <Badge className={`${statusInfo.bg} ${statusInfo.color} border-0 text-xs font-medium`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {to(`status.${item.status}`)}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  )
}
