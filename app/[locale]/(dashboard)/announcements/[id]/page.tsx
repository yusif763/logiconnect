'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { OfferComparisonTable } from '@/components/offers/OfferComparisonTable'
import { OfferComments } from '@/components/offers/OfferComments'
import {
  ArrowLeft, MapPin, Package, Calendar, Weight, Building2,
  Loader2, Plus, CheckCircle, XCircle, Plane, Ship, Train, Truck,
  Eye, Download, FileText, Clock, ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { downloadOfferDoc } from '@/lib/generate-doc'

const transportIcons: Record<string, any> = {
  AIR: Plane, SEA: Ship, RAIL: Train, ROAD: Truck,
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 border-green-200',
  CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

const offerStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 border-yellow-200',
  ACCEPTED: 'bg-green-50 border-green-300',
  REJECTED: 'bg-red-50 border-red-200 opacity-75',
}

export default function AnnouncementDetailPage() {
  const { data: session } = useSession()
  const t = useTranslations('announcements')
  const to = useTranslations('offers')
  const tc = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string

  const [announcement, setAnnouncement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [downloadingOffer, setDownloadingOffer] = useState<string | null>(null)

  const fetchAnnouncement = async () => {
    const res = await fetch(`/api/announcements/${id}`)
    const data = await res.json()
    setAnnouncement(data)
    setLoading(false)
  }

  useEffect(() => { fetchAnnouncement() }, [id])

  const isSupplier = session?.user.role === 'SUPPLIER_EMPLOYEE'
  const isLogistics = session?.user.role === 'LOGISTICS_EMPLOYEE'
  const isOwner = announcement?.supplierId === session?.user.companyId
  const myOffer = announcement?.offers?.find(
    (o: any) => o.logisticsCompanyId === session?.user.companyId
  )
  const hasOffer = !!myOffer

  const updateStatus = async (status: string) => {
    setUpdating(status)
    await fetch(`/api/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchAnnouncement()
    setUpdating(null)
  }

  const updateOfferStatus = async (offerId: string, status: string) => {
    setUpdating(offerId)
    await fetch(`/api/offers/${offerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchAnnouncement()
    setUpdating(null)
  }

  const handleDownloadOffer = async (offer: any) => {
    setDownloadingOffer(offer.id)
    try {
      const res = await fetch(`/api/offers/${offer.id}/comments`)
      const comments = res.ok ? await res.json() : []
      downloadOfferDoc(
        {
          ...offer,
          announcement: {
            ...announcement,
            supplier: announcement.supplier,
          },
        },
        comments
      )
    } finally {
      setDownloadingOffer(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!announcement) return <p className="text-center py-12 text-slate-500">Not found</p>

  const deadline = new Date(announcement.deadline)
  const isExpiringSoon =
    deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && announcement.status === 'ACTIVE'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="text-slate-500">
          <Link href={`/${locale}/announcements`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {tc('back')}
          </Link>
        </Button>
      </div>

      {/* ── Announcement Header Card ─────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top accent bar */}
        <div className={cn(
          'h-1.5 w-full',
          announcement.status === 'ACTIVE' ? 'bg-green-500' :
          announcement.status === 'CLOSED' ? 'bg-slate-400' : 'bg-red-400'
        )} />

        <div className="p-6">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{announcement.title}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-700">{announcement.supplier?.name}</span>
              </div>
            </div>
            <Badge className={cn('shrink-0 text-sm px-3 py-1 border', statusColors[announcement.status])}>
              {t(`status.${announcement.status}`)}
            </Badge>
          </div>

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <Package className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Cargo</p>
                <p className="text-sm font-medium text-slate-800">{announcement.cargoType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <Weight className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Weight / Volume</p>
                <p className="text-sm font-medium text-slate-800">
                  {announcement.weight.toLocaleString()} kg
                  {announcement.volume ? ` · ${announcement.volume} m³` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 sm:col-span-2">
              <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Route</p>
                <p className="text-sm font-medium text-slate-800">
                  {announcement.origin} <span className="text-slate-400 mx-1">→</span> {announcement.destination}
                </p>
              </div>
            </div>
            <div className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 sm:col-span-2',
              isExpiringSoon ? 'bg-orange-50' : 'bg-slate-50'
            )}>
              <Calendar className={cn('h-5 w-5 shrink-0', isExpiringSoon ? 'text-orange-400' : 'text-slate-400')} />
              <div>
                <p className="text-xs text-slate-400">Deadline</p>
                <p className={cn('text-sm font-medium', isExpiringSoon ? 'text-orange-600' : 'text-slate-800')}>
                  {format(deadline, 'MMMM dd, yyyy HH:mm')}
                  {isExpiringSoon && <span className="ml-2 text-xs font-bold">⚡ Expiring soon</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {announcement.description && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-blue-400 mb-1 font-medium">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{announcement.description}</p>
            </div>
          )}

          {/* ── Owner actions ──────────────────────────────────── */}
          {isOwner && announcement.status === 'ACTIVE' && (
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <Button
                variant="outline" size="sm"
                onClick={() => updateStatus('CLOSED')}
                disabled={!!updating}
              >
                {updating === 'CLOSED' && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                {t('closeAnnouncement')}
              </Button>
              <Button
                variant="outline" size="sm"
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                onClick={() => updateStatus('CANCELLED')}
                disabled={!!updating}
              >
                {t('cancelAnnouncement')}
              </Button>
            </div>
          )}

          {/* ── Logistics: submit or view own offer ────────────── */}
          {isLogistics && (
            <div className="pt-4 border-t border-slate-100">
              {!hasOffer && announcement.status === 'ACTIVE' && session?.user.isVerified ? (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href={`/${locale}/announcements/${id}/offer`}>
                    <Plus className="h-4 w-4 mr-2" />
                    {to('createOffer')}
                  </Link>
                </Button>
              ) : hasOffer ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-sm font-semibold text-green-700">{to('alreadySubmitted')}</span>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/${locale}/offers/${myOffer.id}`}>
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View My Offer
                    </Link>
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    disabled={downloadingOffer === myOffer.id}
                    onClick={() => handleDownloadOffer(myOffer)}
                  >
                    {downloadingOffer === myOffer.id
                      ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      : <Download className="h-3.5 w-3.5 mr-1.5" />}
                    Download .doc
                  </Button>
                </div>
              ) : announcement.status !== 'ACTIVE' ? (
                <p className="text-sm text-slate-500">This announcement is no longer accepting offers.</p>
              ) : !session?.user.isVerified ? (
                <p className="text-sm text-amber-600">Your company must be verified to submit offers.</p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* ── Offers Section (supplier/admin) ───────────────────── */}
      {(isOwner || session?.user.role === 'ADMIN') && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              Offers
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({announcement.offers?.length ?? 0})
              </span>
            </h2>
          </div>

          {(!announcement.offers || announcement.offers.length === 0) ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No offers yet</p>
              <p className="text-sm text-slate-400 mt-1">Logistics companies will submit offers here</p>
            </div>
          ) : (
            <Tabs defaultValue="cards">
              <TabsList className="mb-4">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="compare">Compare Offers</TabsTrigger>
              </TabsList>

              <TabsContent value="cards">
                <div className="space-y-4">
                  {announcement.offers.map((offer: any) => (
                    <div
                      key={offer.id}
                      className={cn(
                        'rounded-2xl border-2 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md',
                        offerStatusColors[offer.status]
                      )}
                    >
                      {/* Offer header */}
                      <div className="px-5 py-4 border-b border-inherit flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{offer.logisticsCompany?.name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {format(new Date(offer.createdAt), 'MMM dd, yyyy · HH:mm')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <OfferStatusBadge status={offer.status} label={to(`status.${offer.status}`)} />
                          <Button asChild variant="ghost" size="sm" className="text-slate-500 h-8">
                            <Link href={`/${locale}/offers/${offer.id}`}>
                              <ExternalLink className="h-3.5 w-3.5 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-slate-500 h-8"
                            disabled={downloadingOffer === offer.id}
                            onClick={() => handleDownloadOffer(offer)}
                          >
                            {downloadingOffer === offer.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Download className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>

                      {/* Transport items */}
                      <div className="px-5 py-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {offer.items?.map((item: any, idx: number) => {
                            const Icon = transportIcons[item.transportType] || Truck
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm"
                              >
                                <Icon className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold text-slate-700">
                                  {to(`transport.${item.transportType}`)}
                                </span>
                                <span className="text-sm font-bold text-slate-900">
                                  {item.price.toLocaleString()} {item.currency}
                                </span>
                                <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                                  {item.deliveryDays}d
                                </span>
                              </div>
                            )
                          })}
                        </div>

                        {offer.notes && (
                          <div className="mb-3 bg-slate-50 rounded-lg px-3 py-2">
                            <p className="text-xs text-slate-400 mb-0.5">Notes</p>
                            <p className="text-sm text-slate-600 italic">&ldquo;{offer.notes}&rdquo;</p>
                          </div>
                        )}

                        {/* Accept / Reject */}
                        {isOwner && offer.status === 'PENDING' && announcement.status === 'ACTIVE' && (
                          <div className="flex gap-2 mb-4">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateOfferStatus(offer.id, 'ACCEPTED')}
                              disabled={!!updating}
                            >
                              {updating === offer.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                              {to('accept')}
                            </Button>
                            <Button
                              size="sm" variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => updateOfferStatus(offer.id, 'REJECTED')}
                              disabled={!!updating}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1.5" />
                              {to('reject')}
                            </Button>
                          </div>
                        )}

                        {/* Chat */}
                        <OfferComments
                          offerId={offer.id}
                          myCompanyId={session?.user.companyId ?? ''}
                          supplierCompanyId={announcement.supplierId}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="compare">
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <OfferComparisonTable
                    offers={announcement.offers}
                    isOwner={isOwner}
                    announcementStatus={announcement.status}
                    onOfferUpdate={async (offerId, status) => {
                      await updateOfferStatus(offerId, status)
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  )
}
