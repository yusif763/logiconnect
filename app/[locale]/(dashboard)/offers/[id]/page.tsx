'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { ArrowLeft, Loader2, CheckCircle, XCircle, Plane, Ship, Train, Truck, MapPin, Building2, Download, Edit } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { OfferComments } from '@/components/offers/OfferComments'
import { OfferHistory } from '@/components/offers/OfferHistory'
import { EditOfferModal } from '@/components/offers/EditOfferModal'
import { downloadOfferDoc } from '@/lib/generate-doc'

const transportIcons: Record<string, any> = {
  AIR: Plane, SEA: Ship, RAIL: Train, ROAD: Truck,
}

export default function OfferDetailPage() {
  const { data: session } = useSession()
  const t = useTranslations('offers')
  const tc = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string

  const [offer, setOffer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const handleDownload = async () => {
    if (!offer) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/offers/${id}/comments`)
      const comments = res.ok ? await res.json() : []
      downloadOfferDoc(offer, comments)
    } finally {
      setDownloading(false)
    }
  }

  const fetchOffer = async () => {
    const res = await fetch(`/api/offers/${id}`)
    setOffer(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchOffer() }, [id])

  const isOwner = offer?.announcement?.supplier?.id === session?.user.companyId
  const isLogisticsCompany = offer?.logisticsCompany?.id === session?.user.companyId
  const canEdit = isLogisticsCompany && offer?.status === 'PENDING'

  const updateStatus = async (status: string) => {
    setUpdating(true)
    await fetch(`/api/offers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchOffer()
    setUpdating(false)
  }

  const handleEditOffer = async (data: { notes?: string; items: any[] }) => {
    await fetch(`/api/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchOffer()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  if (!offer) return <p>Not found</p>

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/offers`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {tc('back')}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              {t('editOffer')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading
              ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              : <Download className="h-3.5 w-3.5 mr-1.5" />}
            {t('downloadDoc')}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">{offer.announcement?.title}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {offer.announcement?.origin} → {offer.announcement?.destination}
              </p>
            </div>
            <OfferStatusBadge status={offer.status} label={t(`status.${offer.status}`)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="font-medium">{offer.logisticsCompany?.name}</span>
          </div>

          {offer.notes && (
            <p className="text-sm text-slate-600 italic mb-4 p-3 bg-slate-50 rounded-lg">
              &ldquo;{offer.notes}&rdquo;
            </p>
          )}

          <div className="space-y-3">
            {offer.items?.map((item: any, idx: number) => {
              const Icon = transportIcons[item.transportType] || Truck
              return (
                <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-slate-500" />
                    <span className="font-medium text-sm">{t(`transport.${item.transportType}`)}</span>
                    {item.notes && <span className="text-xs text-slate-400">— {item.notes}</span>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{item.price.toLocaleString()} {item.currency}</p>
                    <p className="text-xs text-slate-500">{item.deliveryDays} days</p>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Submitted {format(new Date(offer.createdAt), 'MMM dd, yyyy HH:mm')}
            {offer.updatedAt && offer.updatedAt !== offer.createdAt && (
              <span className="ml-2 text-orange-500">
                · Updated {format(new Date(offer.updatedAt), 'MMM dd, HH:mm')}
              </span>
            )}
          </p>

          {isOwner && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
              {offer.status === 'PENDING' && (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 flex-1"
                    onClick={() => updateStatus('ACCEPTED')}
                    disabled={updating}
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    {t('accept')}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-1"
                    onClick={() => updateStatus('REJECTED')}
                    disabled={updating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {t('reject')}
                  </Button>
                </>
              )}

              {offer.status === 'ACCEPTED' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => updateStatus('PENDING')}
                    disabled={updating}
                  >
                    {updating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    {t('returnToPending')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => updateStatus('REJECTED')}
                    disabled={updating}
                  >
                    {updating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                    {t('reject')}
                  </Button>
                </>
              )}

              {offer.status === 'REJECTED' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => updateStatus('PENDING')}
                    disabled={updating}
                  >
                    {updating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    {t('returnToPending')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => updateStatus('ACCEPTED')}
                    disabled={updating}
                  >
                    {updating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    {t('accept')}
                  </Button>
                </>
              )}
            </div>
          )}

          <OfferComments
            offerId={id}
            myCompanyId={session?.user.companyId ?? ''}
            supplierCompanyId={offer.announcement?.supplier?.id ?? ''}
          />
        </CardContent>
      </Card>

      {/* History */}
      <OfferHistory offerId={id} />

      {/* Edit Modal */}
      {offer && (
        <EditOfferModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          offer={offer}
          onSave={handleEditOffer}
        />
      )}
    </div>
  )
}
