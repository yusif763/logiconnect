import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'SUPPLIER_EMPLOYEE' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const companyId =
      session.user.role === 'ADMIN'
        ? (new URL(request.url).searchParams.get('companyId') || session.user.companyId)
        : session.user.companyId

    const announcements = await prisma.announcement.findMany({
      where: { supplierId: companyId },
      include: {
        offers: {
          include: {
            logisticsCompany: { select: { id: true, name: true } },
            items: true,
            submittedBy: { select: { name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // ── Basic counters ────────────────────────────────────────────
    const totalAnnouncements = announcements.length
    const activeAnnouncements = announcements.filter((a) => a.status === 'ACTIVE').length
    const closedAnnouncements = announcements.filter((a) => a.status === 'CLOSED').length
    const cancelledAnnouncements = announcements.filter((a) => a.status === 'CANCELLED').length

    const allOffers = announcements.flatMap((a) => a.offers)
    const totalOffers = allOffers.length
    const acceptedOffers = allOffers.filter((o) => o.status === 'ACCEPTED').length
    const rejectedOffers = allOffers.filter((o) => o.status === 'REJECTED').length
    const pendingOffers = allOffers.filter((o) => o.status === 'PENDING').length

    const avgOffersPerAnnouncement =
      totalAnnouncements > 0 ? +(totalOffers / totalAnnouncements).toFixed(1) : 0

    const acceptanceRate =
      closedAnnouncements > 0 ? +((acceptedOffers / closedAnnouncements) * 100).toFixed(1) : 0

    // ── Savings vs median ─────────────────────────────────────────
    let totalSavings = 0
    let avgAcceptedPrice = 0
    const priceSpread: any[] = []
    let acceptedPriceSum = 0
    let acceptedPriceCount = 0

    for (const ann of announcements) {
      const allItems = ann.offers.flatMap((o) => o.items)
      if (allItems.length === 0) continue

      const prices = allItems.map((i) => i.price).sort((a, b) => a - b)
      const mid = Math.floor(prices.length / 2)
      const medianPrice =
        prices.length % 2 === 0 ? (prices[mid - 1] + prices[mid]) / 2 : prices[mid]

      const accepted = ann.offers.find((o) => o.status === 'ACCEPTED')
      const acceptedPrice = accepted
        ? accepted.items.reduce((s, i) => s + i.price, 0)
        : null

      if (acceptedPrice !== null) {
        const savings = medianPrice - acceptedPrice
        totalSavings += savings
        acceptedPriceSum += acceptedPrice
        acceptedPriceCount++

        priceSpread.push({
          title:
            ann.title.length > 22 ? ann.title.slice(0, 22) + '…' : ann.title,
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0,
          median: Math.round(medianPrice),
          accepted: Math.round(acceptedPrice),
        })
      }
    }
    avgAcceptedPrice =
      acceptedPriceCount > 0 ? Math.round(acceptedPriceSum / acceptedPriceCount) : 0

    // ── Monthly trends ────────────────────────────────────────────
    const now = new Date()
    const monthlyAnnouncements = []
    const monthlySpend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = date.toLocaleDateString('en', { month: 'short', year: '2-digit' })

      const monthAnns = announcements.filter((a) => {
        const c = new Date(a.createdAt)
        return c >= date && c < nextDate
      })
      monthlyAnnouncements.push({ month: label, count: monthAnns.length })

      const monthAccepted = monthAnns
        .flatMap((a) => a.offers)
        .filter((o) => o.status === 'ACCEPTED')
      const monthRevenue = monthAccepted
        .flatMap((o) => o.items)
        .reduce((s, i) => s + i.price, 0)

      monthlySpend.push({
        month: label,
        spend: monthRevenue,
        deals: monthAccepted.length,
      })
    }

    // ── Logistics leaderboard ─────────────────────────────────────
    const companyMap = new Map<string, { name: string; bids: number; wins: number; prices: number[] }>()
    for (const ann of announcements) {
      for (const offer of ann.offers) {
        const id = offer.logisticsCompany?.id
        const name = offer.logisticsCompany?.name
        if (!id || !name) continue
        if (!companyMap.has(id)) companyMap.set(id, { name, bids: 0, wins: 0, prices: [] })
        const entry = companyMap.get(id)!
        entry.bids++
        if (offer.status === 'ACCEPTED') entry.wins++
        offer.items.forEach((i) => entry.prices.push(i.price))
      }
    }
    const logisticsLeaderboard = Array.from(companyMap.values())
      .map((c) => ({
        name: c.name,
        bids: c.bids,
        wins: c.wins,
        winRate: c.bids > 0 ? +((c.wins / c.bids) * 100).toFixed(1) : 0,
        avgPrice: c.prices.length > 0 ? Math.round(c.prices.reduce((a, b) => a + b, 0) / c.prices.length) : 0,
        minPrice: c.prices.length > 0 ? Math.min(...c.prices) : 0,
      }))
      .sort((a, b) => b.bids - a.bids)

    // ── Route analysis ────────────────────────────────────────────
    const routeMap = new Map<string, { count: number; prices: number[]; days: number[] }>()
    for (const ann of announcements) {
      const key = `${ann.origin}→${ann.destination}`
      if (!routeMap.has(key)) routeMap.set(key, { count: 0, prices: [], days: [] })
      const r = routeMap.get(key)!
      r.count++
      const accepted = ann.offers.find((o) => o.status === 'ACCEPTED')
      if (accepted) {
        accepted.items.forEach((i) => {
          r.prices.push(i.price)
          r.days.push(i.deliveryDays)
        })
      }
    }
    const topRoutes = Array.from(routeMap.entries())
      .map(([route, v]) => ({
        route,
        shipments: v.count,
        avgCost: v.prices.length > 0 ? Math.round(v.prices.reduce((a, b) => a + b, 0) / v.prices.length) : 0,
        avgDays: v.days.length > 0 ? Math.round(v.days.reduce((a, b) => a + b, 0) / v.days.length) : 0,
      }))
      .sort((a, b) => b.shipments - a.shipments)
      .slice(0, 10)

    // ── Cargo type breakdown ──────────────────────────────────────
    const cargoMap = new Map<string, { count: number; offerCounts: number[]; prices: number[] }>()
    for (const ann of announcements) {
      const t = ann.cargoType
      if (!cargoMap.has(t)) cargoMap.set(t, { count: 0, offerCounts: [], prices: [] })
      const c = cargoMap.get(t)!
      c.count++
      c.offerCounts.push(ann.offers.length)
      const accepted = ann.offers.find((o) => o.status === 'ACCEPTED')
      if (accepted) accepted.items.forEach((i) => c.prices.push(i.price))
    }
    const cargoTypeStats = Array.from(cargoMap.entries())
      .map(([type, v]) => ({
        type,
        announcements: v.count,
        avgOffers:
          v.offerCounts.length > 0
            ? +(v.offerCounts.reduce((a, b) => a + b, 0) / v.offerCounts.length).toFixed(1)
            : 0,
        avgCost: v.prices.length > 0 ? Math.round(v.prices.reduce((a, b) => a + b, 0) / v.prices.length) : 0,
      }))
      .sort((a, b) => b.announcements - a.announcements)

    // ── Per-announcement detail ───────────────────────────────────
    const announcementDetail = announcements.map((ann) => {
      const offers = ann.offers
      const allItems = offers.flatMap((o) => o.items)
      const prices = allItems.map((i) => i.price)
      const accepted = offers.find((o) => o.status === 'ACCEPTED')
      const acceptedItems = accepted?.items ?? []
      const acceptedPrice =
        acceptedItems.length > 0 ? Math.min(...acceptedItems.map((i) => i.price)) : null

      return {
        id: ann.id,
        title: ann.title,
        cargoType: ann.cargoType,
        origin: ann.origin,
        destination: ann.destination,
        status: ann.status,
        deadline: ann.deadline,
        createdAt: ann.createdAt,
        offerCount: offers.length,
        pendingCount: offers.filter((o) => o.status === 'PENDING').length,
        acceptedCount: offers.filter((o) => o.status === 'ACCEPTED').length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        acceptedPrice,
        acceptedCompany: accepted?.logisticsCompany?.name ?? null,
        offers: offers.map((o) => ({
          id: o.id,
          status: o.status,
          company: o.logisticsCompany?.name,
          submittedBy: o.submittedBy?.name,
          notes: o.notes,
          createdAt: o.createdAt,
          items: o.items.map((i) => ({
            transportType: i.transportType,
            price: i.price,
            currency: i.currency,
            deliveryDays: i.deliveryDays,
          })),
        })),
      }
    })

    return NextResponse.json({
      // KPIs
      totalAnnouncements,
      activeAnnouncements,
      closedAnnouncements,
      cancelledAnnouncements,
      totalOffers,
      acceptedOffers,
      rejectedOffers,
      pendingOffers,
      avgOffersPerAnnouncement,
      acceptanceRate,
      totalSavings: Math.round(totalSavings),
      avgAcceptedPrice,
      // Charts
      offerStatusBreakdown: [
        { name: 'Pending', value: pendingOffers },
        { name: 'Accepted', value: acceptedOffers },
        { name: 'Rejected', value: rejectedOffers },
      ],
      monthlyAnnouncements,
      monthlySpend,
      priceSpread: priceSpread.slice(0, 8),
      // Tables
      logisticsLeaderboard,
      topRoutes,
      cargoTypeStats,
      announcementDetail,
    })
  } catch (error) {
    console.error('Error fetching supplier reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
