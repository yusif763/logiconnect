'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { LineChartCard } from '@/components/reports/LineChartCard'
import { BarChartCard } from '@/components/reports/BarChartCard'
import { MarketComparisonChart } from '@/components/employees/MarketComparisonChart'
import { OfferBreakdownTable } from '@/components/employees/OfferBreakdownTable'
import { AnnouncementBreakdownTable } from '@/components/employees/AnnouncementBreakdownTable'
import { CompetitivenessIndicator } from '@/components/employees/CompetitivenessIndicator'
import {
  ArrowLeft, Loader2, Shield, User, TrendingUp, TrendingDown, Minus,
  FileText, CheckCircle, BarChart3, Megaphone, Target
} from 'lucide-react'

const PERIODS = [
  { value: '1m', labelKey: 'period1m' },
  { value: '3m', labelKey: 'period3m' },
  { value: '6m', labelKey: 'period6m' },
  { value: '1y', labelKey: 'period1y' },
]

const trendIcons: Record<string, any> = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
}

const trendColors: Record<string, string> = {
  improving: 'text-emerald-600 bg-emerald-50',
  declining: 'text-red-600 bg-red-50',
  stable: 'text-slate-600 bg-slate-100',
}

export default function EmployeePerformancePage() {
  const { data: session } = useSession()
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string
  const t = useTranslations('performance')
  const te = useTranslations('employees')

  const [period, setPeriod] = useState('3m')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/employee/${id}?period=${period}`)
      const json = await res.json()
      setData(json)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchReport()
  }, [session, id, period])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data || data.error) {
    return <p className="text-slate-500">Could not load report.</p>
  }

  const { employee, noData, companyType, summary, timeline, offerBreakdown, announcementBreakdown, marketComparison, trend } = data

  const initials = employee?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const TrendIcon = trend ? trendIcons[trend] : Minus

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="text-slate-600">
        <Link href={`/${locale}/employees`}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          {te('title')}
        </Link>
      </Button>

      {/* Employee Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
              <Badge
                variant={employee.isCompanyAdmin ? 'default' : 'secondary'}
                className={employee.isCompanyAdmin ? 'bg-blue-600 text-white' : ''}
              >
                {employee.isCompanyAdmin ? (
                  <><Shield className="h-3 w-3 mr-1" />{te('companyAdmin')}</>
                ) : (
                  <><User className="h-3 w-3 mr-1" />{te('employee')}</>
                )}
              </Badge>
              {trend && (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendColors[trend]}`}>
                  <TrendIcon className="h-3 w-3" />
                  {t(trend as any)}
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-0.5">{employee.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              {te('memberSince')} {format(new Date(employee.createdAt), 'MMMM yyyy')} · {employee.companyName}
            </p>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="bg-slate-100">
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value} className="text-sm">
              {t(p.labelKey as any)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* No Data State */}
      {noData ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="p-4 bg-slate-50 rounded-full inline-flex mb-4">
            <BarChart3 className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">{t('noData')}</p>
          <p className="text-slate-400 text-sm mt-1">Try a longer period</p>
        </div>
      ) : companyType === 'LOGISTICS' ? (
        <>
          {/* Logistics Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('totalOffers')}
              value={summary.totalOffers}
              icon={FileText}
            />
            <StatsCard
              title={t('won')}
              value={summary.won}
              icon={CheckCircle}
            />
            <StatsCard
              title={t('winRate')}
              value={`${summary.winRate}%`}
              icon={TrendingUp}
            />
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500 mb-2">{t('avgCompetitiveness')}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2">{summary.avgCompetitiveness}%</p>
              <CompetitivenessIndicator score={summary.avgCompetitiveness} showLabel={true} />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            <LineChartCard
              title={t('winRate')}
              data={timeline.map((b: any) => ({ name: b.label, value: b.winRate }))}
              dataKey="value"
              xKey="name"
              colors={['#3b82f6']}
            />
            <BarChartCard
              title="Offers per Period"
              data={timeline.map((b: any) => ({ name: b.label, value: b.totalOffers }))}
              dataKey="value"
              xKey="name"
              colors={['#818cf8']}
            />
          </div>

          {/* Market Comparison Chart */}
          {marketComparison && marketComparison.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <MarketComparisonChart data={marketComparison} />
              </CardContent>
            </Card>
          )}

          {/* Offer Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('offerBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <OfferBreakdownTable items={offerBreakdown || []} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Supplier Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={t('totalAnnouncements')}
              value={summary.totalAnnouncements}
              icon={Megaphone}
            />
            <StatsCard
              title={t('totalOffersReceived')}
              value={summary.totalOffersReceived}
              icon={FileText}
            />
            <StatsCard
              title={t('accepted')}
              value={summary.accepted}
              icon={CheckCircle}
            />
            <StatsCard
              title={t('avgOffersPerAnnouncement')}
              value={summary.avgOffersPerAnnouncement?.toFixed(1)}
              icon={Target}
            />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-4">
            <LineChartCard
              title="Offers Received Over Time"
              data={timeline.map((b: any) => ({ name: b.label, value: b.totalOffersReceived }))}
              dataKey="value"
              xKey="name"
              colors={['#3b82f6']}
            />
            <BarChartCard
              title="Announcements per Period"
              data={timeline.map((b: any) => ({ name: b.label, value: b.totalAnnouncements }))}
              dataKey="value"
              xKey="name"
              colors={['#818cf8']}
            />
          </div>

          {/* Announcement Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('announcementBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementBreakdownTable items={announcementBreakdown || []} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
