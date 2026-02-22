import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [companies, announcements, offers, offerItems, shipments] = await Promise.all([
      prisma.company.findMany({ include: { users: { select: { id: true } } } }),
      prisma.announcement.findMany({
        include: { supplier: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offer.findMany({
        include: {
          logisticsCompany: { select: { id: true, name: true } },
          items: true,
          announcement: {
            select: { id: true, origin: true, destination: true, cargoType: true, supplierId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offerItem.findMany(),
      prisma.shipment.findMany(),
    ])

    // ── Platform KPIs ─────────────────────────────────────────────
    const totalCompanies = companies.length
    const verifiedCompanies = companies.filter((c: any) => c.isVerified).length
    const pendingVerifications = companies.filter((c: any) => !c.isVerified && c.isActive).length
    const supplierCount = companies.filter((c: any) => c.type === 'SUPPLIER').length
    const logisticsCount = companies.filter((c: any) => c.type === 'LOGISTICS').length
    const totalUsers = companies.reduce((s: number, c: any) => s + c.users.length, 0)

    const totalAnnouncements = announcements.length
    const activeAnnouncements = announcements.filter((a: any) => a.status === 'ACTIVE').length
    const totalOffers = offers.length
    const acceptedOffers = offers.filter((o: any) => o.status === 'ACCEPTED').length
    const platformRevenue = offers
      .filter((o: any) => o.status === 'ACCEPTED')
      .flatMap((o: any) => o.items)
      .reduce((s: number, i: any) => s + i.price, 0)
    const globalWinRate =
      totalOffers > 0 ? +((acceptedOffers / totalOffers) * 100).toFixed(1) : 0

    const verificationRate =
      totalCompanies > 0 ? +((verifiedCompanies / totalCompanies) * 100).toFixed(1) : 0

    // ── Monthly platform activity (12 months) ─────────────────────
    const now = new Date()
    const monthlyActivity = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = date.toLocaleDateString('en', { month: 'short', year: '2-digit' })

      const monthAnns = announcements.filter((a: any) => {
        const c = new Date(a.createdAt)
        return c >= date && c < nextDate
      }).length
      const monthOffers = offers.filter((o: any) => {
        const c = new Date(o.createdAt)
        return c >= date && c < nextDate
      }).length
      const monthReg = companies.filter((c: any) => {
        const created = new Date(c.createdAt)
        return created >= date && created < nextDate
      }).length
      const monthRevenue = offers
        .filter((o: any) => {
          const c = new Date(o.createdAt)
          return o.status === 'ACCEPTED' && c >= date && c < nextDate
        })
        .flatMap((o: any) => o.items)
        .reduce((s: number, i: any) => s + i.price, 0)

      monthlyActivity.push({
        month: label,
        announcements: monthAnns,
        offers: monthOffers,
        registrations: monthReg,
        revenue: monthRevenue,
      })
    }

    // ── Top logistics companies ───────────────────────────────────
    const logMap = new Map<string, { name: string; offers: number; wins: number; revenue: number }>()
    for (const offer of offers) {
      const id = offer.logisticsCompany?.id
      const name = offer.logisticsCompany?.name
      if (!id || !name) continue
      if (!logMap.has(id)) logMap.set(id, { name, offers: 0, wins: 0, revenue: 0 })
      const entry = logMap.get(id)!
      entry.offers++
      if (offer.status === 'ACCEPTED') {
        entry.wins++
        entry.revenue += offer.items.reduce((s: number, i: any) => s + i.price, 0)
      }
    }
    const topLogistics = Array.from(logMap.values())
      .map((c) => ({
        name: c.name,
        totalOffers: c.offers,
        accepted: c.wins,
        winRate: c.offers > 0 ? +((c.wins / c.offers) * 100).toFixed(1) : 0,
        revenue: c.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // ── Top suppliers ─────────────────────────────────────────────
    const supMap = new Map<string, { name: string; announcements: number; offersReceived: number; accepted: number }>()
    for (const ann of announcements) {
      const id = ann.supplier?.id
      const name = ann.supplier?.name
      if (!id || !name) continue
      if (!supMap.has(id)) supMap.set(id, { name, announcements: 0, offersReceived: 0, accepted: 0 })
      const s = supMap.get(id)!
      s.announcements++
    }
    for (const offer of offers) {
      const supplierId = offer.announcement.supplierId
      if (supMap.has(supplierId)) {
        const s = supMap.get(supplierId)!
        s.offersReceived++
        if (offer.status === 'ACCEPTED') s.accepted++
      }
    }
    const topSuppliers = Array.from(supMap.values())
      .sort((a, b) => b.announcements - a.announcements)

    // ── Geographic analysis ───────────────────────────────────────
    const routeMap = new Map<string, { count: number; accepted: number; volume: number }>()
    for (const offer of offers) {
      const key = `${offer.announcement.origin} → ${offer.announcement.destination}`
      if (!routeMap.has(key)) routeMap.set(key, { count: 0, accepted: 0, volume: 0 })
      const r = routeMap.get(key)!
      r.count++
      if (offer.status === 'ACCEPTED') {
        r.accepted++
        r.volume += offer.items.reduce((s: number, i: any) => s + i.price, 0)
      }
    }
    const topRoutes = Array.from(routeMap.entries())
      .map(([route, v]) => ({
        route,
        totalOffers: v.count,
        accepted: v.accepted,
        volume: v.volume,
      }))
      .sort((a, b) => b.totalOffers - a.totalOffers)
      .slice(0, 15)

    // ── Cargo type distribution ───────────────────────────────────
    const cargoMap = new Map<string, number>()
    for (const ann of announcements) {
      cargoMap.set(ann.cargoType, (cargoMap.get(ann.cargoType) ?? 0) + 1)
    }
    const cargoDistribution = Array.from(cargoMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    // ── Transport type distribution (platform-wide) ───────────────
    const transportCounts = ['AIR', 'SEA', 'RAIL', 'ROAD'].map((type) => ({
      name: type,
      value: offerItems.filter((i: any) => i.transportType === type).length,
    }))

    // ── Shipment status breakdown ─────────────────────────────────
    const shipmentStatuses = ['BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const shipmentBreakdown = shipmentStatuses.map((s) => ({
      name: s.replace('_', ' '),
      value: shipments.filter((sh: any) => sh.status === s).length,
    }))

    // ── Weekly new registrations (last 8 weeks) ───────────────────
    const weeklyRegistrations = []
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i * 7)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 7)
      const label = `W${date.getMonth() + 1}/${date.getDate()}`
      weeklyRegistrations.push({
        week: label,
        count: companies.filter((c: any) => {
          const created = new Date(c.createdAt)
          return created >= date && created < nextDate
        }).length,
      })
    }

    return NextResponse.json({
      // KPIs
      totalCompanies,
      verifiedCompanies,
      pendingVerifications,
      supplierCount,
      logisticsCount,
      totalUsers,
      totalAnnouncements,
      activeAnnouncements,
      totalOffers,
      acceptedOffers,
      platformRevenue,
      globalWinRate,
      verificationRate,
      totalShipments: shipments.length,
      activeShipments: shipments.filter((s: any) => s.status !== 'DELIVERED').length,
      // Charts
      companyTypeBreakdown: [
        { name: 'Supplier', value: supplierCount },
        { name: 'Logistics', value: logisticsCount },
      ],
      monthlyActivity,
      cargoDistribution,
      transportCounts,
      shipmentBreakdown,
      weeklyRegistrations,
      // Tables
      topLogistics,
      topSuppliers,
      topRoutes,
    })
  } catch (error) {
    console.error('Error fetching admin reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
