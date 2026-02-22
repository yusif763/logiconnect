'use client'

import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AnnouncementBreakdownItem {
  id: string
  title: string
  cargoType: string
  date: string
  offersCount: number
  minOffer: number | null
  maxOffer: number | null
  acceptedPrice: number | null
  status: string
}

interface AnnouncementBreakdownTableProps {
  items: AnnouncementBreakdownItem[]
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-50 text-red-700',
}

export function AnnouncementBreakdownTable({ items }: AnnouncementBreakdownTableProps) {
  const t = useTranslations('performance')
  const ta = useTranslations('announcements')

  if (items.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">{t('noData')}</p>
  }

  return (
    <ScrollArea className="w-full">
      <div className="min-w-[680px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cargo</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Offers</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Min</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Max</th>
              <th className="text-right py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('acceptedPrice')}</th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3">
                  <p className="font-medium text-slate-900 truncate max-w-[160px]">{item.title}</p>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {item.cargoType}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                  {format(new Date(item.date), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-900">
                  {item.offersCount}
                </td>
                <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">
                  {item.minOffer != null ? `$${item.minOffer.toLocaleString()}` : '—'}
                </td>
                <td className="py-3 px-3 text-right text-slate-500 font-mono text-xs">
                  {item.maxOffer != null ? `$${item.maxOffer.toLocaleString()}` : '—'}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {item.acceptedPrice != null ? (
                    <span className="text-emerald-700 font-semibold">${item.acceptedPrice.toLocaleString()}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <Badge className={`${statusColors[item.status] || statusColors.CLOSED} border-0 text-xs font-medium`}>
                    {ta(`status.${item.status}`)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  )
}
