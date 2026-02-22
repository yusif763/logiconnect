'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PieChartCard } from '@/components/reports/PieChartCard'
import { LineChartCard } from '@/components/reports/LineChartCard'
import { BarChartCard } from '@/components/reports/BarChartCard'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { OfferCard } from '@/components/offers/OfferCard'
import { Button } from '@/components/ui/button'
import { Loader2, Megaphone, FileText, CheckCircle, TrendingUp, Building2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DashboardPage() {
  const { data: session } = useSession()
  const t = useTranslations('dashboard')
  const params = useParams()
  const locale = params.locale as string
  const [data, setData] = useState<any>(null)
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    const fetchData = async () => {
      try {
        const role = session.user.role
        if (role === 'SUPPLIER_EMPLOYEE') {
          const [reportsRes, annRes] = await Promise.all([
            fetch('/api/reports/supplier'),
            fetch('/api/announcements?mine=true'),
          ])
          const [reports, announcements] = await Promise.all([reportsRes.json(), annRes.json()])
          setData(reports)
          setRecentItems(announcements.slice(0, 3))
        } else if (role === 'LOGISTICS_EMPLOYEE') {
          const [reportsRes, offersRes] = await Promise.all([
            fetch('/api/reports/logistics'),
            fetch('/api/offers'),
          ])
          const [reports, offers] = await Promise.all([reportsRes.json(), offersRes.json()])
          setData(reports)
          setRecentItems(offers.slice(0, 3))
        } else if (role === 'ADMIN') {
          const reportsRes = await fetch('/api/reports/admin')
          setData(await reportsRes.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const role = session?.user.role

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('welcome')}, {session?.user.name?.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">{session?.user.companyName}</p>
      </div>

      {/* Supplier Dashboard */}
      {role === 'SUPPLIER_EMPLOYEE' && data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={t('totalAnnouncements')} value={data.totalAnnouncements} icon={Megaphone} />
            <StatsCard title={t('activeAnnouncements')} value={data.activeAnnouncements} icon={TrendingUp} />
            <StatsCard title={t('totalOffers')} value={data.totalOffers} icon={FileText} />
            <StatsCard title={t('acceptedOffers')} value={data.acceptedOffers} icon={CheckCircle} />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <PieChartCard title="Offers by Status" data={data.offerStatusBreakdown || []} />
            <LineChartCard
              title="Monthly Announcements"
              data={data.monthlyAnnouncements || []}
              dataKey="count"
              xKey="month"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('recentAnnouncements')}</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${locale}/announcements`}>View all</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentItems.map(ann => (
                <AnnouncementCard key={ann.id} announcement={ann} locale={locale} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Logistics Dashboard */}
      {role === 'LOGISTICS_EMPLOYEE' && data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={t('myOffers')} value={data.totalOffers} icon={FileText} />
            <StatsCard title={t('acceptedOffers')} value={data.acceptedOffers} icon={CheckCircle} />
            <StatsCard title={`${t('winRate')} %`} value={`${data.winRate}%`} icon={TrendingUp} />
            <StatsCard title="Pending" value={data.pendingOffers} icon={Megaphone} />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <LineChartCard
              title="Win Rate Over Time"
              data={data.monthlyWinRate || []}
              dataKey="winRate"
              xKey="month"
            />
            <BarChartCard
              title="Revenue by Transport Type"
              data={data.transportBreakdown || []}
              dataKey="avgPrice"
              xKey="name"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('recentOffers')}</h2>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${locale}/offers`}>View all</Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentItems.map(offer => (
                <OfferCard key={offer.id} offer={offer} locale={locale} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Admin Dashboard */}
      {role === 'ADMIN' && data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={t('totalCompanies')} value={data.totalCompanies} icon={Building2} />
            <StatsCard title={t('pendingVerifications')} value={data.pendingVerifications} icon={AlertTriangle} />
            <StatsCard title={t('totalAnnouncements')} value={data.totalAnnouncements} icon={Megaphone} />
            <StatsCard title={t('totalOffers')} value={data.totalOffers} icon={FileText} />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <PieChartCard title="Companies by Type" data={data.companyTypeBreakdown || []} />
            <LineChartCard
              title="Platform Activity"
              data={data.monthlyActivity || []}
              dataKey={['announcements', 'offers']}
              xKey="month"
            />
          </div>
        </>
      )}
    </div>
  )
}
