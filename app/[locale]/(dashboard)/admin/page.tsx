'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter, useParams } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PieChartCard } from '@/components/reports/PieChartCard'
import { LineChartCard } from '@/components/reports/LineChartCard'
import { Button } from '@/components/ui/button'
import { Building2, Users, Megaphone, FileText, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session } = useSession()
  const t = useTranslations('admin')
  const td = useTranslations('dashboard')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user.role !== 'ADMIN') {
      router.push(`/${locale}/dashboard`)
      return
    }
    fetch('/api/reports/admin')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [session])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/admin/companies`}>{t('companies')}</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/admin/users`}>{t('users')}</Link>
          </Button>
        </div>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title={td('totalCompanies')} value={data.totalCompanies} icon={Building2} />
            <StatsCard title={td('pendingVerifications')} value={data.pendingVerifications} icon={AlertTriangle} />
            <StatsCard title={td('totalAnnouncements')} value={data.totalAnnouncements} icon={Megaphone} />
            <StatsCard title={td('totalOffers')} value={data.totalOffers} icon={FileText} />
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
