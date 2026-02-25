'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  History,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  User,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface OfferHistoryProps {
  offerId: string
}

interface HistoryItem {
  id: string
  action: string
  oldStatus: string | null
  newStatus: string | null
  changedByUser?: {
    name: string
    email: string
    role: string
  } | null
  note?: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  ACCEPTED: 'bg-green-100 text-green-700 border-green-300',
  REJECTED: 'bg-red-100 text-red-700 border-red-300',
}

const actionIcons: Record<string, any> = {
  CREATED: Plus,
  UPDATED: Edit,
  STATUS_CHANGED: History,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
}

function ChangeDetails({ note, t }: { note: string, t: any }) {
  try {
    const changes = JSON.parse(note)

    return (
      <div className="mt-3 space-y-3">
        {/* Notes changes */}
        {(changes.oldNotes !== changes.newNotes) && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase">{t('history.notesLabel')}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                <p className="font-medium text-red-700 mb-1">{t('history.previous')}</p>
                <p className="text-slate-600 italic">{changes.oldNotes || t('history.empty')}</p>
              </div>
              <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                <p className="font-medium text-green-700 mb-1">{t('history.new')}</p>
                <p className="text-slate-600 italic">{changes.newNotes || t('history.empty')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Items changes */}
        {changes.oldItems && changes.newItems && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase">{t('history.transportTypes')}</p>

            {/* Old items */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-700">{t('history.previous')}</p>
              {changes.oldItems.map((item: any, idx: number) => (
                <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-xs flex items-center justify-between">
                  <div>
                    <span className="font-medium">{t(`transport.${item.transportType}`)}</span>
                    {item.notes && <span className="text-slate-500 ml-2">• {item.notes}</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.price.toLocaleString()} {item.currency}</p>
                    <p className="text-slate-500">{item.deliveryDays} {t('history.days')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* New items */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-green-700">{t('history.new')}</p>
              {changes.newItems.map((item: any, idx: number) => (
                <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded text-xs flex items-center justify-between">
                  <div>
                    <span className="font-medium">{t(`transport.${item.transportType}`)}</span>
                    {item.notes && <span className="text-slate-500 ml-2">• {item.notes}</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.price.toLocaleString()} {item.currency}</p>
                    <p className="text-slate-500">{item.deliveryDays} {t('history.days')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    // If note is not JSON, just display it as text
    return <p className="text-sm text-slate-600 mt-2">{note}</p>
  }
}

export function OfferHistory({ offerId }: OfferHistoryProps) {
  const t = useTranslations('offers')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/offers/${offerId}/history`)
        if (res.ok) {
          const data = await res.json()
          setHistory(data)
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [offerId])

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12">
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-slate-500" />
          {t('history.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => {
            const Icon = actionIcons[item.action] || History
            const isLast = index === history.length - 1

            return (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={cn(
                    "shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10",
                    item.newStatus === 'ACCEPTED' ? "bg-green-100" :
                    item.newStatus === 'REJECTED' ? "bg-red-100" :
                    "bg-slate-100"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      item.newStatus === 'ACCEPTED' ? "text-green-600" :
                      item.newStatus === 'REJECTED' ? "text-red-600" :
                      "text-slate-600"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover-lift">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-slate-900">
                          {t(`history.${item.action.toLowerCase()}`) || item.action}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                          <Clock className="h-3 w-3" />
                          {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
                        </div>
                      </div>

                      {/* Status Change */}
                      {item.oldStatus && item.newStatus && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", statusColors[item.oldStatus] || '')}
                          >
                            {t(`status.${item.oldStatus}`) || item.oldStatus}
                          </Badge>
                          <span className="text-slate-400">→</span>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", statusColors[item.newStatus] || '')}
                          >
                            {t(`status.${item.newStatus}`) || item.newStatus}
                          </Badge>
                        </div>
                      )}

                      {/* Note / Change Details */}
                      {item.note && (
                        item.action === 'UPDATED'
                          ? <ChangeDetails note={item.note} t={t} />
                          : <p className="text-sm text-slate-600 mb-2">{item.note}</p>
                      )}

                      {/* Changed by */}
                      {item.changedByUser && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                          <User className="h-3 w-3" />
                          <span>{item.changedByUser.name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">{item.changedByUser.role.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}