'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { OfferStatusBadge } from './OfferStatusBadge'
import { Building2, Calendar, Eye, Plane, Ship, Train, Truck, User } from 'lucide-react'
import { format } from 'date-fns'

const transportIcons: Record<string, any> = {
  AIR: Plane,
  SEA: Ship,
  RAIL: Train,
  ROAD: Truck,
}

interface OfferCardProps {
  offer: {
    id: string
    status: string
    notes?: string | null
    createdAt: string | Date
    updatedAt?: string | Date
    announcement: {
      id: string
      title: string
      origin: string
      destination: string
      supplier?: { name: string }
      createdBy?: { name: string }
    }
    logisticsCompany?: { name: string }
    submittedBy?: { name: string }
    items: Array<{
      transportType: string
      price: number
      currency: string
      deliveryDays: number
    }>
  }
  locale: string
  showCompany?: boolean
  showSupplier?: boolean
  showSubmitter?: boolean
}

export function OfferCard({ offer, locale, showCompany, showSupplier, showSubmitter }: OfferCardProps) {
  const t = useTranslations('offers')
  const tc = useTranslations('common')

  return (
    <Card className="hover:shadow-md transition-shadow hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate text-sm">
              {offer.announcement.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {offer.announcement.origin} → {offer.announcement.destination}
            </p>

            <div className="flex flex-col gap-1 mt-2">
              {showCompany && offer.logisticsCompany && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700 truncate">
                    {offer.logisticsCompany.name}
                  </span>
                </div>
              )}

              {showSupplier && offer.announcement.supplier && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="text-xs text-slate-600 truncate">
                    {offer.announcement.supplier.name}
                  </span>
                </div>
              )}

              {showSubmitter && offer.submittedBy && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                  <span className="text-xs text-slate-600 truncate">
                    {offer.submittedBy.name}
                  </span>
                </div>
              )}

              {offer.announcement.createdBy && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="text-xs text-slate-500 truncate">
                    Elan: {offer.announcement.createdBy.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          <OfferStatusBadge status={offer.status} label={t(`status.${offer.status}`)} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {offer.items.map((item, idx) => {
            const Icon = transportIcons[item.transportType] || Truck
            return (
              <div key={idx} className="flex items-center gap-1.5 bg-slate-50 rounded-md px-2 py-1.5">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  {t(`transport.${item.transportType}`)}
                </span>
                <span className="text-xs text-slate-600">
                  {item.price.toLocaleString()} {item.currency}
                </span>
                <span className="text-xs text-slate-400">· {item.deliveryDays}d</span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(offer.createdAt), 'MMM dd, yyyy')}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href={`/${locale}/offers/${offer.id}`}>
              <Eye className="h-4 w-4 mr-1.5" />
              {tc('view')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
