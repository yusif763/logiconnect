'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { MapPin, Package, Calendar, Weight, Eye, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface AnnouncementCardProps {
  announcement: {
    id: string
    title: string
    cargoType: string
    weight: number
    volume?: number | null
    origin: string
    destination: string
    deadline: string | Date
    status: string
    _count?: { offers: number }
    supplier?: { name: string }
  }
  locale: string
  showSupplier?: boolean
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

export function AnnouncementCard({ announcement, locale, showSupplier }: AnnouncementCardProps) {
  const t = useTranslations('announcements')
  const tc = useTranslations('common')
  const deadline = new Date(announcement.deadline)
  const isExpiringSoon = deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000

  return (
    <Card className="hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{announcement.title}</h3>
            {showSupplier && announcement.supplier && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="text-sm font-semibold text-blue-700 truncate">
                  {announcement.supplier.name}
                </span>
              </div>
            )}
          </div>
          <Badge className={cn('text-xs shrink-0', statusColors[announcement.status])}>
            {t(`status.${announcement.status}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Package className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{announcement.cargoType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Weight className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{announcement.weight.toLocaleString()} kg</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{announcement.origin} → {announcement.destination}</span>
          </div>
          <div className={cn(
            'flex items-center gap-2 text-sm col-span-2',
            isExpiringSoon && announcement.status === 'ACTIVE' ? 'text-orange-600' : 'text-slate-600'
          )}>
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(deadline, 'MMM dd, yyyy')}</span>
            {isExpiringSoon && announcement.status === 'ACTIVE' && (
              <span className="text-xs font-medium">⚡ Expiring soon</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            {announcement._count?.offers ?? 0} {t('offersCount').toLowerCase()}
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href={`/${locale}/announcements/${announcement.id}`}>
              <Eye className="h-4 w-4 mr-1.5" />
              {tc('view')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
