'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { OfferCard } from '@/components/offers/OfferCard'
import { Loader2 } from 'lucide-react'

export default function OffersPage() {
  const { data: session } = useSession()
  const t = useTranslations('offers')
  const params = useParams()
  const locale = params.locale as string
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const isSupplier = session?.user.role === 'SUPPLIER_EMPLOYEE'

  useEffect(() => {
    if (!session) return
    fetch('/api/offers')
      .then(r => r.json())
      .then(data => {
        setOffers(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [session])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isSupplier ? t('receivedOffers') : t('myOffers')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">{t('noOffers')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {offers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              locale={locale}
              showCompany={isSupplier}
            />
          ))}
        </div>
      )}
    </div>
  )
}
