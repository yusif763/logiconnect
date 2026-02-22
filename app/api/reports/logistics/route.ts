import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'LOGISTICS_EMPLOYEE' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const companyId = session.user.companyId

    const offers = await prisma.offer.findMany({
      where: { logisticsCompanyId: companyId },
      include: {
        items: true,
        announcement: {
          select: {
            id: true,
            title: true,
            cargoType: true,
            origin: true,
            destination: true,
            weight: true,
            supplierId: true,
            supplier: { select: { id: true, name: true } },
            // All competing offers on same announcement (for competition analysis)
            offers: {
              include: { items: true },
            },
          },
        },
        submittedBy: { select: { name: true } },
        shipment: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // ── Basic counters ────────────────────────────────────────────
    const totalOffers = offers.length
    const acceptedOffers = offers.filter((o) => o.status === 'ACCEPTED').length
    const rejectedOffers = offers.filter((o) => o.status === 'REJECTED').length
    const pendingOffers = offers.filter((o) => o.status === 'PENDING').length
    const winRate = totalOffers > 0 ? +((acceptedOffers / totalOffers) * 100).toFixed(1) : 0
    const activeShipments = offers.filter(
      (o) => o.shipment && !['DELIVERED'].includes(o.shipment.status)
    ).length

    // Revenue
    const acceptedItems = offers.filter((o) => o.status === 'ACCEPTED').flatMap((o) => o.items)
    const totalRevenue = acceptedItems.reduce((s, i) => s + i.price, 0)
    const avgDealValue = acceptedOffers > 0 ? Math.round(totalRevenue / acceptedOffers) : 0
    const pendingItems = offers.filter((o) => o.status === 'PENDING').flatMap((o) => o.items)
    const pendingRevenue = pendingItems.reduce((s, i) => s + i.price, 0)

    // ── Transport breakdown ────────────────────────────────────────
    const allItems = offers.flatMap((o) => o.items)
    const transportBreakdown = ['AIR', 'SEA', 'RAIL', 'ROAD'].map((type) => {
      const typeItems = allItems.filter((i) => i.transportType === type)
      const typeOffers = offers.filter((o) => o.items.some((i) => i.transportType === type))
      const acceptedTypeOffers = typeOffers.filter((o) => o.status === 'ACCEPTED').length
      const revenue = offers
        .filter((o) => o.status === 'ACCEPTED' && o.items.some((i) => i.transportType === type))
        .flatMap((o) => o.items.filter((i) => i.transportType === type))
        .reduce((s, i) => s + i.price, 0)
      return {
        name: type,
        count: typeItems.length,
        avgPrice:
          typeItems.length > 0
            ? Math.round(typeItems.reduce((s, i) => s + i.price, 0) / typeItems.length)
            : 0,
        winRate:
          typeOffers.length > 0
            ? Math.round((acceptedTypeOffers / typeOffers.length) * 100)
            : 0,
        revenue,
      }
    })

    // ── Monthly trends ────────────────────────────────────────────
    const now = new Date()
    const monthlyWinRate = []
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const label = date.toLocaleDateString('en', { month: 'short', year: '2-digit' })

      const monthOffers = offers.filter((o) => {
        const c = new Date(o.createdAt)
        return c >= date && c < nextDate
      })
      const monthAccepted = monthOffers.filter((o) => o.status === 'ACCEPTED').length
      const monthRev = monthOffers
        .filter((o) => o.status === 'ACCEPTED')
        .flatMap((o) => o.items)
        .reduce((s, i) => s + i.price, 0)

      monthlyWinRate.push({
        month: label,
        winRate: monthOffers.length > 0 ? +((monthAccepted / monthOffers.length) * 100).toFixed(1) : 0,
        total: monthOffers.length,
        accepted: monthAccepted,
      })
      monthlyRevenue.push({
        month: label,
        revenue: monthRev,
        deals: monthAccepted,
      })
    }

    // ── Route performance ─────────────────────────────────────────
    const routeMap = new Map<string, {
      origin: string; destination: string; offers: number; wins: number; prices: number[]
    }>()
    for (const offer of offers) {
      const key = `${offer.announcement.origin}→${offer.announcement.destination}`
      if (!routeMap.has(key))
        routeMap.set(key, {
          origin: offer.announcement.origin,
          destination: offer.announcement.destination,
          offers: 0,
          wins: 0,
          prices: [],
        })
      const r = routeMap.get(key)!
      r.offers++
      if (offer.status === 'ACCEPTED') {
        r.wins++
        offer.items.forEach((i) => r.prices.push(i.price))
      }
    }
    const routePerformance = Array.from(routeMap.values())
      .map((r) => ({
        route: `${r.origin} → ${r.destination}`,
        offers: r.offers,
        wins: r.wins,
        winRate: r.offers > 0 ? +((r.wins / r.offers) * 100).toFixed(1) : 0,
        revenue: r.prices.reduce((a, b) => a + b, 0),
        avgPrice: r.prices.length > 0 ? Math.round(r.prices.reduce((a, b) => a + b, 0) / r.prices.length) : 0,
      }))
      .sort((a, b) => b.offers - a.offers)
      .slice(0, 10)

    // ── Supplier breakdown ────────────────────────────────────────
    const supplierMap = new Map<string, { name: string; offers: number; wins: number; revenue: number }>()
    for (const offer of offers) {
      const id = offer.announcement.supplierId
      const name = offer.announcement.supplier?.name ?? 'Unknown'
      if (!supplierMap.has(id)) supplierMap.set(id, { name, offers: 0, wins: 0, revenue: 0 })
      const s = supplierMap.get(id)!
      s.offers++
      if (offer.status === 'ACCEPTED') {
        s.wins++
        s.revenue += offer.items.reduce((a, i) => a + i.price, 0)
      }
    }
    const supplierStats = Array.from(supplierMap.values())
      .map((s) => ({
        ...s,
        winRate: s.offers > 0 ? +((s.wins / s.offers) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.offers - a.offers)

    // ── Competition analysis ──────────────────────────────────────
    // On REJECTED offers, compare my price vs the winning price
    const competitionSamples: number[] = []
    for (const offer of offers) {
      if (offer.status !== 'REJECTED') continue
      const myTotal = offer.items.reduce((s, i) => s + i.price, 0)
      const winner = offer.announcement.offers.find((o: any) => o.status === 'ACCEPTED')
      if (!winner) continue
      const winnerTotal = winner.items.reduce((s: number, i: any) => s + i.price, 0)
      if (winnerTotal > 0) {
        competitionSamples.push(((myTotal - winnerTotal) / winnerTotal) * 100)
      }
    }
    const avgPriceGap =
      competitionSamples.length > 0
        ? +(competitionSamples.reduce((a, b) => a + b, 0) / competitionSamples.length).toFixed(1)
        : null

    // Cargo type stats
    const cargoMap = new Map<string, { offers: number; wins: number; prices: number[] }>()
    for (const offer of offers) {
      const t = offer.announcement.cargoType
      if (!cargoMap.has(t)) cargoMap.set(t, { offers: 0, wins: 0, prices: [] })
      const c = cargoMap.get(t)!
      c.offers++
      if (offer.status === 'ACCEPTED') {
        c.wins++
        offer.items.forEach((i) => c.prices.push(i.price))
      }
    }
    const cargoTypeStats = Array.from(cargoMap.entries())
      .map(([type, v]) => ({
        type,
        offers: v.offers,
        wins: v.wins,
        winRate: v.offers > 0 ? +((v.wins / v.offers) * 100).toFixed(1) : 0,
        avgPrice: v.prices.length > 0 ? Math.round(v.prices.reduce((a, b) => a + b, 0) / v.prices.length) : 0,
      }))
      .sort((a, b) => b.offers - a.offers)

    // ── Per-offer detail ──────────────────────────────────────────
    const offerDetail = offers.map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.createdAt,
      notes: o.notes,
      submittedBy: o.submittedBy?.name,
      announcement: {
        id: o.announcement.id,
        title: o.announcement.title,
        cargoType: o.announcement.cargoType,
        origin: o.announcement.origin,
        destination: o.announcement.destination,
        weight: o.announcement.weight,
      },
      items: o.items.map((i) => ({
        transportType: i.transportType,
        price: i.price,
        currency: i.currency,
        deliveryDays: i.deliveryDays,
      })),
      myMinPrice: o.items.length > 0 ? Math.min(...o.items.map((i) => i.price)) : 0,
      myMinDays: o.items.length > 0 ? Math.min(...o.items.map((i) => i.deliveryDays)) : 0,
    }))

    return NextResponse.json({
      // KPIs
      totalOffers,
      acceptedOffers,
      rejectedOffers,
      pendingOffers,
      winRate,
      totalRevenue,
      avgDealValue,
      pendingRevenue,
      activeShipments,
      // Competition
      avgPriceGap,
      competitionSampleCount: competitionSamples.length,
      // Charts
      monthlyWinRate,
      monthlyRevenue,
      transportBreakdown,
      // Tables
      routePerformance,
      supplierStats,
      cargoTypeStats,
      offerDetail,
    })
  } catch (error) {
    console.error('Error fetching logistics reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
