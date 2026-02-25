'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AnnouncementsPage() {
  const { data: session } = useSession()
  const t = useTranslations('announcements')
  const tc = useTranslations('common')
  const params = useParams()
  const locale = params.locale as string

  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState({ origin: '', destination: '', cargoType: '' })
  const [activeTab, setActiveTab] = useState('ACTIVE')

  const isSupplier = session?.user.role === 'SUPPLIER_EMPLOYEE'
  const isLogistics = session?.user.role === 'LOGISTICS_EMPLOYEE'

  const fetchAnnouncements = async (status?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (isSupplier) params.set('mine', 'true')
      if (search.origin) params.set('origin', search.origin)
      if (search.destination) params.set('destination', search.destination)
      if (search.cargoType) params.set('cargoType', search.cargoType)
      if (status) params.set('status', status)

      const res = await fetch(`/api/announcements?${params}`)
      const data = await res.json()
      setAnnouncements(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchAnnouncements(activeTab)
  }, [session, activeTab])

  const handleSearch = () => fetchAnnouncements(activeTab)

  const handleReset = () => {
    setSearch({ origin: '', destination: '', cargoType: '' })
    setTimeout(() => fetchAnnouncements(activeTab), 0)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isSupplier ? t('myAnnouncements') : t('pool')}
          </p>
        </div>
        {isSupplier && session?.user.isVerified && (
          <Button asChild>
            <Link href={`/${locale}/announcements/create`}>
              <Plus className="h-4 w-4 mr-2" />
              {t('create')}
            </Link>
          </Button>
        )}
      </div>

      {/* Tabs for Supplier */}
      {isSupplier && (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="ACTIVE">{t('tabs.active')}</TabsTrigger>
            <TabsTrigger value="CLOSED">{t('tabs.closed')}</TabsTrigger>
            <TabsTrigger value="CANCELLED">{t('tabs.cancelled')}</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder={t('filterByOrigin')}
            value={search.origin}
            onChange={(e) => setSearch(s => ({ ...s, origin: e.target.value }))}
            className="flex-1"
          />
          <Input
            placeholder={t('filterByDestination')}
            value={search.destination}
            onChange={(e) => setSearch(s => ({ ...s, destination: e.target.value }))}
            className="flex-1"
          />
          <Input
            placeholder={t('filterByCargoType')}
            value={search.cargoType}
            onChange={(e) => setSearch(s => ({ ...s, cargoType: e.target.value }))}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="shrink-0">
              <Search className="h-4 w-4 mr-2" />
              {tc('search')}
            </Button>
            <Button variant="outline" onClick={handleReset} className="shrink-0">
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500 text-lg">{t('noAnnouncements')}</p>
          {isSupplier && (
            <Button asChild className="mt-4">
              <Link href={`/${locale}/announcements/create`}>
                <Plus className="h-4 w-4 mr-2" />
                {t('create')}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {announcements.map(ann => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              locale={locale}
              showSupplier={isLogistics}
            />
          ))}
        </div>
      )}
    </div>
  )
}
