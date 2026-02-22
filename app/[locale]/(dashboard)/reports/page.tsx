'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PieChartCard } from '@/components/reports/PieChartCard'
import { LineChartCard } from '@/components/reports/LineChartCard'
import { BarChartCard } from '@/components/reports/BarChartCard'
import { AreaChartCard } from '@/components/reports/AreaChartCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Loader2, FileText, CheckCircle, TrendingUp, Megaphone, MapPin, Package,
  DollarSign, Plane, Ship, Train, Truck, Building2, Award, BarChart3,
  Globe, ChevronDown, ChevronUp, Download, Target, Users, Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const transportIcons: Record<string, any> = { AIR: Plane, SEA: Ship, RAIL: Train, ROAD: Truck }

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

// ─── CSV Export ──────────────────────────────────────────────
function downloadCSV(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const val = row[c.key] ?? ''
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
        })
        .join(',')
    )
    .join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Reusable table ──────────────────────────────────────────
function DataTable({ columns, rows, emptyText = 'No data yet.' }: {
  columns: { key: string; label: string; right?: boolean; render?: (val: any, row: any) => React.ReactNode }[]
  rows: any[]
  emptyText?: string
}) {
  if (!rows?.length) return <p className="text-slate-500 text-sm py-6 text-center">{emptyText}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-slate-50/80">
            {columns.map((c) => (
              <th key={c.key} className={cn('px-4 py-3 font-medium text-slate-600 whitespace-nowrap', c.right ? 'text-right' : 'text-left')}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-slate-50/60 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className={cn('px-4 py-3', c.right ? 'text-right' : '')}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Win rate pill ───────────────────────────────────────────
function WinRatePill({ rate }: { rate: number }) {
  const color = rate >= 60 ? 'bg-green-100 text-green-700' : rate >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', color)}>{rate}%</span>
}

// ─── Supplier Detail Table (collapsible) ────────────────────
function SupplierDetailTable({ data, locale }: { data: any[]; locale: string }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const router = useRouter()
  if (!data?.length) return <p className="text-slate-500 text-sm py-6 text-center">No announcements yet.</p>
  return (
    <div className="space-y-2">
      {data.map((ann) => (
        <div key={ann.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === ann.id ? null : ann.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-medium text-sm text-blue-700 hover:underline cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); router.push(`/${locale}/announcements/${ann.id}`) }}
                  >{ann.title}</span>
                  <Badge className={cn('text-xs shrink-0', statusColors[ann.status])}>{ann.status}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {ann.origin} → {ann.destination}
                  <span className="text-slate-300">·</span>
                  <Package className="h-3 w-3 shrink-0" />
                  {ann.cargoType}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500 font-medium">{ann.offerCount} offer{ann.offerCount !== 1 ? 's' : ''}</p>
                {ann.minPrice != null && (
                  <p className="text-xs text-slate-500">${ann.minPrice.toLocaleString()} – ${ann.maxPrice?.toLocaleString()}</p>
                )}
              </div>
              {ann.acceptedCompany && (
                <span className="text-xs text-green-600 font-semibold hidden md:block">✓ {ann.acceptedCompany}</span>
              )}
              {expanded === ann.id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
          </button>

          {expanded === ann.id && (
            <div className="border-t bg-slate-50/50 p-4">
              {ann.offers.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No offers received yet.</p>
              ) : (
                <div className="space-y-2">
                  {ann.offers.map((offer: any) => (
                    <div
                      key={offer.id}
                      className={cn(
                        'bg-white rounded-lg p-3 border',
                        offer.status === 'ACCEPTED' && 'border-green-300 bg-green-50/30',
                        offer.status === 'REJECTED' && 'border-red-100 opacity-70',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold text-sm text-slate-900">{offer.company}</span>
                          {offer.submittedBy && <span className="text-xs text-slate-400">by {offer.submittedBy}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn('text-xs', statusColors[offer.status])}>{offer.status}</Badge>
                          <button
                            onClick={() => router.push(`/${locale}/offers/${offer.id}`)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >View →</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {offer.items.map((item: any, idx: number) => {
                          const Icon = transportIcons[item.transportType] || Truck
                          return (
                            <div key={idx} className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1 text-xs">
                              <Icon className="h-3 w-3 text-slate-500" />
                              <span className="font-medium">{item.transportType}</span>
                              <span className="text-slate-700">${item.price.toLocaleString()}</span>
                              <span className="text-slate-400">· {item.deliveryDays}d</span>
                            </div>
                          )
                        })}
                      </div>
                      {offer.notes && <p className="text-xs text-slate-500 italic mt-1.5">&ldquo;{offer.notes}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function ReportsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) ?? 'en'

  useEffect(() => {
    if (!session) return
    const endpoint =
      session.user.role === 'SUPPLIER_EMPLOYEE'
        ? '/api/reports/supplier'
        : session.user.role === 'LOGISTICS_EMPLOYEE'
        ? '/api/reports/logistics'
        : '/api/reports/admin'

    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
  }, [session])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const role = session?.user.role

  // ─── SUPPLIER ───────────────────────────────────────────────
  if (role === 'SUPPLIER_EMPLOYEE' && data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <Button
            size="sm" variant="outline"
            onClick={() => downloadCSV('announcements.csv', data.announcementDetail ?? [], [
              { key: 'title', label: 'Title' },
              { key: 'cargoType', label: 'Cargo Type' },
              { key: 'origin', label: 'Origin' },
              { key: 'destination', label: 'Destination' },
              { key: 'status', label: 'Status' },
              { key: 'offerCount', label: 'Offers' },
              { key: 'acceptedPrice', label: 'Accepted Price ($)' },
              { key: 'acceptedCompany', label: 'Accepted Company' },
            ])}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detail">Announcements</TabsTrigger>
            <TabsTrigger value="leaderboard">Logistics Partners</TabsTrigger>
            <TabsTrigger value="routes">Routes & Cargo</TabsTrigger>
          </TabsList>

          {/* ── Overview ──────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Announcements" value={data.totalAnnouncements} icon={Megaphone} />
              <StatsCard title="Offers Received" value={data.totalOffers} icon={FileText} />
              <StatsCard title="Deals Closed" value={data.acceptedOffers} icon={CheckCircle} />
              <StatsCard title="Acceptance Rate" value={`${data.acceptanceRate}%`} icon={Target} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Avg Offers / Announcement" value={data.avgOffersPerAnnouncement} icon={TrendingUp} />
              <StatsCard title="Total Savings vs Median" value={`$${(data.totalSavings ?? 0).toLocaleString()}`} icon={DollarSign} />
              <StatsCard title="Avg Accepted Price" value={`$${(data.avgAcceptedPrice ?? 0).toLocaleString()}`} icon={Award} />
              <StatsCard title="Pending Offers" value={data.pendingOffers} icon={Activity} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <AreaChartCard
                title="Monthly Spend Trend"
                data={data.monthlySpend ?? []}
                dataKey="spend"
                xKey="month"
                formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
                colors={['#3b82f6']}
              />
              <PieChartCard title="Offer Response Breakdown" data={data.offerStatusBreakdown ?? []} />
            </div>

            {/* Price Spread */}
            {(data.priceSpread ?? []).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Price Range vs Accepted Deal (per Announcement)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartCard
                    title=""
                    data={data.priceSpread ?? []}
                    dataKey={['min', 'median', 'accepted']}
                    xKey="title"
                    colors={['#cbd5e1', '#94a3b8', '#3b82f6']}
                    height={220}
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              <LineChartCard
                title="Monthly Announcements Created"
                data={data.monthlyAnnouncements ?? []}
                dataKey="count"
                xKey="month"
              />
              <BarChartCard
                title="Announcement Status Breakdown"
                data={[
                  { name: 'Active', value: data.activeAnnouncements },
                  { name: 'Closed', value: data.closedAnnouncements },
                  { name: 'Cancelled', value: data.cancelledAnnouncements },
                ]}
                dataKey="value"
                xKey="name"
                colors={['#10b981', '#64748b', '#ef4444']}
              />
            </div>
          </TabsContent>

          {/* ── Announcement Detail ────────────────────────────── */}
          <TabsContent value="detail">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-500" />
                  All Announcements with Offer Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SupplierDetailTable data={data.announcementDetail ?? []} locale={locale} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Logistics Leaderboard ──────────────────────────── */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Logistics Company Performance
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('logistics-partners.csv', data.logisticsLeaderboard ?? [], [
                    { key: 'name', label: 'Company' },
                    { key: 'bids', label: 'Bids' },
                    { key: 'wins', label: 'Wins' },
                    { key: 'winRate', label: 'Win Rate (%)' },
                    { key: 'avgPrice', label: 'Avg Price ($)' },
                    { key: 'minPrice', label: 'Min Price ($)' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.logisticsLeaderboard ?? []}
                  emptyText="No offers received yet."
                  columns={[
                    { key: 'name', label: 'Company', render: (v: string) => <span className="font-semibold text-slate-900">{v}</span> },
                    { key: 'bids', label: 'Total Bids', right: true },
                    { key: 'wins', label: 'Wins', right: true, render: (v: number) => <span className="font-medium text-green-600">{v}</span> },
                    { key: 'winRate', label: 'Win Rate', right: true, render: (v: number) => <WinRatePill rate={v} /> },
                    { key: 'avgPrice', label: 'Avg Price', right: true, render: (v: number) => `$${v.toLocaleString()}` },
                    { key: 'minPrice', label: 'Best Price', right: true, render: (v: number) => <span className="text-blue-600 font-medium">${v.toLocaleString()}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Routes & Cargo ─────────────────────────────────── */}
          <TabsContent value="routes" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Top Shipping Routes
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('routes.csv', data.topRoutes ?? [], [
                    { key: 'route', label: 'Route' },
                    { key: 'shipments', label: 'Shipments' },
                    { key: 'avgCost', label: 'Avg Cost ($)' },
                    { key: 'avgDays', label: 'Avg Days' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.topRoutes ?? []}
                  emptyText="No completed shipments yet."
                  columns={[
                    { key: 'route', label: 'Route', render: (v: string) => (
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        {v}
                      </div>
                    )},
                    { key: 'shipments', label: 'Shipments', right: true },
                    { key: 'avgCost', label: 'Avg Cost', right: true, render: (v: number) => v ? `$${v.toLocaleString()}` : '—' },
                    { key: 'avgDays', label: 'Avg Transit', right: true, render: (v: number) => v ? `${v} days` : '—' },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Cargo Type Analysis
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('cargo-types.csv', data.cargoTypeStats ?? [], [
                    { key: 'type', label: 'Cargo Type' },
                    { key: 'announcements', label: 'Announcements' },
                    { key: 'avgOffers', label: 'Avg Offers' },
                    { key: 'avgCost', label: 'Avg Cost ($)' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.cargoTypeStats ?? []}
                  emptyText="No cargo data yet."
                  columns={[
                    { key: 'type', label: 'Cargo Type', render: (v: string) => <span className="font-medium">{v}</span> },
                    { key: 'announcements', label: 'Announcements', right: true },
                    { key: 'avgOffers', label: 'Avg Offers', right: true },
                    { key: 'avgCost', label: 'Avg Cost', right: true, render: (v: number) => v ? `$${v.toLocaleString()}` : '—' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // ─── LOGISTICS ──────────────────────────────────────────────
  if (role === 'LOGISTICS_EMPLOYEE' && data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <Button
            size="sm" variant="outline"
            onClick={() => downloadCSV('offer-history.csv', data.offerDetail ?? [], [
              { key: 'id', label: 'Offer ID' },
              { key: 'status', label: 'Status' },
              { key: 'myMinPrice', label: 'Price ($)' },
              { key: 'myMinDays', label: 'Delivery Days' },
              { key: 'createdAt', label: 'Date' },
            ])}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Offer History</TabsTrigger>
            <TabsTrigger value="routes">Route Performance</TabsTrigger>
            <TabsTrigger value="competition">Competition</TabsTrigger>
          </TabsList>

          {/* ── Overview ──────────────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Offers" value={data.totalOffers} icon={FileText} />
              <StatsCard title="Win Rate" value={`${data.winRate}%`} icon={Target} />
              <StatsCard title="Total Revenue" value={`$${(data.totalRevenue ?? 0).toLocaleString()}`} icon={DollarSign} />
              <StatsCard title="Avg Deal Value" value={`$${(data.avgDealValue ?? 0).toLocaleString()}`} icon={Award} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Pending Value" value={`$${(data.pendingRevenue ?? 0).toLocaleString()}`} icon={TrendingUp} />
              <StatsCard title="Active Shipments" value={data.activeShipments ?? 0} icon={Activity} />
              <StatsCard title="Accepted Offers" value={data.acceptedOffers} icon={CheckCircle} />
              <StatsCard title="Pending Offers" value={data.pendingOffers} icon={Megaphone} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <AreaChartCard
                title="Monthly Revenue"
                data={data.monthlyRevenue ?? []}
                dataKey="revenue"
                xKey="month"
                colors={['#10b981']}
                formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <LineChartCard
                title="Win Rate Trend"
                data={data.monthlyWinRate ?? []}
                dataKey={['winRate', 'total']}
                xKey="month"
                colors={['#3b82f6', '#cbd5e1']}
              />
            </div>

            {/* Transport type breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Performance by Transport Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(data.transportBreakdown ?? []).filter((t: any) => t.count > 0).map((t: any) => {
                    const Icon = transportIcons[t.name] || Truck
                    return (
                      <div key={t.name} className="bg-slate-50 rounded-xl p-4 space-y-2 border">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-sm">{t.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{t.count}</div>
                        <div className="text-xs text-slate-500">items submitted</div>
                        <WinRatePill rate={t.winRate} />
                        <div className="text-xs text-slate-500">avg ${t.avgPrice.toLocaleString()}</div>
                        <div className="text-xs font-medium text-green-600">
                          ${t.revenue.toLocaleString()} revenue
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <BarChartCard
                title="Offers by Month (Submitted vs Accepted)"
                data={data.monthlyWinRate ?? []}
                dataKey={['total', 'accepted']}
                xKey="month"
                colors={['#cbd5e1', '#3b82f6']}
              />
              <BarChartCard
                title="Revenue by Transport Type ($)"
                data={(data.transportBreakdown ?? []).filter((t: any) => t.revenue > 0)}
                dataKey="revenue"
                xKey="name"
                colors={['#10b981']}
              />
            </div>
          </TabsContent>

          {/* ── Offer History ──────────────────────────────────── */}
          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Complete Offer History
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('offer-history.csv', data.offerDetail ?? [], [
                    { key: 'status', label: 'Status' },
                    { key: 'myMinPrice', label: 'Min Price ($)' },
                    { key: 'myMinDays', label: 'Min Days' },
                    { key: 'createdAt', label: 'Date' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Announcement</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Route</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-600">Transport & Price</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-600">Days</th>
                        <th className="text-center px-4 py-3 font-medium text-slate-600">Status</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.offerDetail ?? []).map((offer: any) => (
                        <tr key={offer.id}
                          onClick={() => router.push(`/${locale}/offers/${offer.id}`)}
                          className={cn(
                            'border-b last:border-0 hover:bg-blue-50/40 transition-colors cursor-pointer',
                            offer.status === 'ACCEPTED' && 'bg-green-50/40',
                            offer.status === 'REJECTED' && 'opacity-60',
                          )}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900 line-clamp-1">{offer.announcement.title}</p>
                            <p className="text-xs text-slate-400">{offer.announcement.cargoType} · {offer.announcement.weight.toLocaleString()} kg</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-slate-600">{offer.announcement.origin}</p>
                            <p className="text-xs text-slate-600">→ {offer.announcement.destination}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {offer.items.map((item: any, i: number) => {
                                const Icon = transportIcons[item.transportType] || Truck
                                return (
                                  <span key={i} className="flex items-center gap-1 text-xs bg-slate-100 rounded px-1.5 py-0.5">
                                    <Icon className="h-2.5 w-2.5" />
                                    ${item.price.toLocaleString()}
                                  </span>
                                )
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-slate-600">{offer.myMinDays}d</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={cn('text-xs', statusColors[offer.status])}>{offer.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-slate-400">
                            {new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Route Performance ──────────────────────────────── */}
          <TabsContent value="routes" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Route Performance
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('route-performance.csv', data.routePerformance ?? [], [
                    { key: 'route', label: 'Route' },
                    { key: 'offers', label: 'Offers' },
                    { key: 'wins', label: 'Won' },
                    { key: 'winRate', label: 'Win Rate (%)' },
                    { key: 'avgPrice', label: 'Avg Price ($)' },
                    { key: 'revenue', label: 'Revenue ($)' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.routePerformance ?? []}
                  emptyText="No route data yet."
                  columns={[
                    { key: 'route', label: 'Route', render: (v: string) => (
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />{v}
                      </div>
                    )},
                    { key: 'offers', label: 'Offers', right: true },
                    { key: 'wins', label: 'Won', right: true, render: (v: number) => <span className="text-green-600 font-medium">{v}</span> },
                    { key: 'winRate', label: 'Win Rate', right: true, render: (v: number) => <WinRatePill rate={v} /> },
                    { key: 'avgPrice', label: 'Avg Price', right: true, render: (v: number) => v ? `$${v.toLocaleString()}` : '—' },
                    { key: 'revenue', label: 'Revenue', right: true, render: (v: number) => <span className="font-semibold text-slate-900">${v.toLocaleString()}</span> },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Cargo type stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Cargo Type Specialization
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.cargoTypeStats ?? []}
                  emptyText="No cargo data yet."
                  columns={[
                    { key: 'type', label: 'Cargo Type', render: (v: string) => <span className="font-medium">{v}</span> },
                    { key: 'offers', label: 'Offers', right: true },
                    { key: 'wins', label: 'Wins', right: true, render: (v: number) => <span className="text-green-600 font-medium">{v}</span> },
                    { key: 'winRate', label: 'Win Rate', right: true, render: (v: number) => <WinRatePill rate={v} /> },
                    { key: 'avgPrice', label: 'Avg Price', right: true, render: (v: number) => v ? `$${v.toLocaleString()}` : '—' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Competition Analysis ───────────────────────────── */}
          <TabsContent value="competition" className="space-y-6">
            {/* Competitiveness score card */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Price Gap vs Winner</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {data.avgPriceGap !== null
                          ? `${data.avgPriceGap > 0 ? '+' : ''}${data.avgPriceGap}%`
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {data.avgPriceGap !== null
                      ? data.avgPriceGap > 0
                        ? `On average your lost bids were ${data.avgPriceGap}% above the winner's price.`
                        : 'You are pricing below winners on average — consider other factors.'
                      : `Based on ${data.competitionSampleCount ?? 0} analyzed lost deals.`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Overall Win Rate</p>
                      <p className="text-2xl font-bold text-slate-900">{data.winRate}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {data.acceptedOffers} won out of {data.totalOffers} total bids.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Supplier breakdown */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Performance by Supplier
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('supplier-stats.csv', data.supplierStats ?? [], [
                    { key: 'name', label: 'Supplier' },
                    { key: 'offers', label: 'Offers' },
                    { key: 'wins', label: 'Wins' },
                    { key: 'winRate', label: 'Win Rate (%)' },
                    { key: 'revenue', label: 'Revenue ($)' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.supplierStats ?? []}
                  emptyText="No supplier data yet."
                  columns={[
                    { key: 'name', label: 'Supplier', render: (v: string) => (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="font-semibold text-slate-900">{v}</span>
                      </div>
                    )},
                    { key: 'offers', label: 'Bids', right: true },
                    { key: 'wins', label: 'Wins', right: true, render: (v: number) => <span className="text-green-600 font-medium">{v}</span> },
                    { key: 'winRate', label: 'Win Rate', right: true, render: (v: number) => <WinRatePill rate={v} /> },
                    { key: 'revenue', label: 'Revenue', right: true, render: (v: number) => <span className="font-semibold">${v.toLocaleString()}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // ─── ADMIN ──────────────────────────────────────────────────
  if (role === 'ADMIN' && data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Platform Reports</h1>
          <Button size="sm" variant="outline"
            onClick={() => downloadCSV('platform-routes.csv', data.topRoutes ?? [], [
              { key: 'route', label: 'Route' },
              { key: 'totalOffers', label: 'Offers' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'volume', label: 'Volume ($)' },
            ])}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            <TabsTrigger value="geo">Geographic</TabsTrigger>
            <TabsTrigger value="health">Health Metrics</TabsTrigger>
          </TabsList>

          {/* ── Platform Overview ──────────────────────────────── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Companies" value={data.totalCompanies} icon={Building2} />
              <StatsCard title="Verified Companies" value={data.verifiedCompanies} icon={CheckCircle} />
              <StatsCard title="Pending Verification" value={data.pendingVerifications} icon={Activity} />
              <StatsCard title="Total Users" value={data.totalUsers} icon={Users} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Announcements" value={data.totalAnnouncements} icon={Megaphone} />
              <StatsCard title="Total Offers" value={data.totalOffers} icon={FileText} />
              <StatsCard title="Platform Revenue" value={`$${(data.platformRevenue ?? 0).toLocaleString()}`} icon={DollarSign} />
              <StatsCard title="Global Win Rate" value={`${data.globalWinRate}%`} icon={Target} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <AreaChartCard
                title="Platform Revenue (12 months)"
                data={data.monthlyActivity ?? []}
                dataKey="revenue"
                xKey="month"
                colors={['#3b82f6']}
                formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
                height={260}
              />
              <LineChartCard
                title="Announcements & Offers Activity"
                data={data.monthlyActivity ?? []}
                dataKey={['announcements', 'offers']}
                xKey="month"
                colors={['#8b5cf6', '#f59e0b']}
                height={260}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <PieChartCard title="Company Type Split" data={data.companyTypeBreakdown ?? []} />
              <PieChartCard title="Transport Type Usage" data={data.transportCounts ?? []} />
              <PieChartCard title="Shipment Status" data={(data.shipmentBreakdown ?? []).filter((s: any) => s.value > 0)} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <BarChartCard
                title="Monthly New Registrations"
                data={data.monthlyActivity ?? []}
                dataKey="registrations"
                xKey="month"
                colors={['#10b981']}
              />
              <BarChartCard
                title="Top Cargo Types (Announcements)"
                data={data.cargoDistribution ?? []}
                dataKey="value"
                xKey="name"
                colors={['#6366f1']}
              />
            </div>
          </TabsContent>

          {/* ── Leaderboards ───────────────────────────────────── */}
          <TabsContent value="leaderboards" className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Top Logistics Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.topLogistics ?? []}
                  emptyText="No data yet."
                  columns={[
                    { key: 'name', label: 'Company', render: (v: string, row: any, i?: number) => (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-5 text-right shrink-0">{(data.topLogistics ?? []).indexOf(row) + 1}.</span>
                        <span className="font-semibold text-slate-900">{v}</span>
                      </div>
                    )},
                    { key: 'totalOffers', label: 'Bids', right: true },
                    { key: 'winRate', label: 'Win %', right: true, render: (v: number) => <WinRatePill rate={v} /> },
                    { key: 'revenue', label: 'Revenue', right: true, render: (v: number) => <span className="font-semibold text-green-700">${v.toLocaleString()}</span> },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-blue-500" />
                  Top Supplier Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.topSuppliers ?? []}
                  emptyText="No data yet."
                  columns={[
                    { key: 'name', label: 'Company', render: (v: string, row: any) => (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-5 text-right shrink-0">{(data.topSuppliers ?? []).indexOf(row) + 1}.</span>
                        <span className="font-semibold text-slate-900">{v}</span>
                      </div>
                    )},
                    { key: 'announcements', label: 'Announcements', right: true },
                    { key: 'offersReceived', label: 'Offers Recv.', right: true },
                    { key: 'accepted', label: 'Accepted', right: true, render: (v: number) => <span className="text-green-600 font-medium">{v}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Geographic Analysis ────────────────────────────── */}
          <TabsContent value="geo">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  Top Shipping Routes (Platform-wide)
                </CardTitle>
                <Button size="sm" variant="outline"
                  onClick={() => downloadCSV('platform-routes.csv', data.topRoutes ?? [], [
                    { key: 'route', label: 'Route' },
                    { key: 'totalOffers', label: 'Offers' },
                    { key: 'accepted', label: 'Accepted' },
                    { key: 'volume', label: 'Volume ($)' },
                  ])}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  rows={data.topRoutes ?? []}
                  emptyText="No route data yet."
                  columns={[
                    { key: 'route', label: 'Route', render: (v: string, row: any) => (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5 shrink-0">{(data.topRoutes ?? []).indexOf(row) + 1}</span>
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{v}</span>
                      </div>
                    )},
                    { key: 'totalOffers', label: 'Total Offers', right: true },
                    { key: 'accepted', label: 'Closed Deals', right: true, render: (v: number) => <span className="text-green-600 font-medium">{v}</span> },
                    { key: 'volume', label: 'Volume', right: true, render: (v: number) => <span className="font-semibold text-slate-900">${v.toLocaleString()}</span> },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Health Metrics ─────────────────────────────────── */}
          <TabsContent value="health" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500 mb-1">Verification Rate</p>
                  <p className="text-3xl font-bold text-slate-900">{data.verificationRate}%</p>
                  <p className="text-xs text-slate-400 mt-1">{data.verifiedCompanies} of {data.totalCompanies} companies verified</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.verificationRate}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500 mb-1">Pending Verifications</p>
                  <p className="text-3xl font-bold text-orange-500">{data.pendingVerifications}</p>
                  <p className="text-xs text-slate-400 mt-1">Companies awaiting admin review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500 mb-1">Active Shipments</p>
                  <p className="text-3xl font-bold text-green-600">{data.activeShipments}</p>
                  <p className="text-xs text-slate-400 mt-1">of {data.totalShipments} total shipments in progress</p>
                </CardContent>
              </Card>
            </div>

            <BarChartCard
              title="Weekly New Company Registrations"
              data={data.weeklyRegistrations ?? []}
              dataKey="count"
              xKey="week"
              colors={['#8b5cf6']}
            />

            <div className="grid lg:grid-cols-2 gap-6">
              <PieChartCard title="Shipment Status Distribution" data={(data.shipmentBreakdown ?? []).filter((s: any) => s.value > 0)} />
              <BarChartCard
                title="Platform Monthly Activity"
                data={data.monthlyActivity?.slice(-6) ?? []}
                dataKey={['announcements', 'offers', 'registrations']}
                xKey="month"
                colors={['#3b82f6', '#10b981', '#8b5cf6']}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return null
}
