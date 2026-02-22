import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

function getPeriodStart(period: string): Date {
  const now = new Date()
  switch (period) {
    case '1m': now.setMonth(now.getMonth() - 1); break
    case '3m': now.setMonth(now.getMonth() - 3); break
    case '6m': now.setMonth(now.getMonth() - 6); break
    case '1y': now.setFullYear(now.getFullYear() - 1); break
    default: now.setMonth(now.getMonth() - 1)
  }
  return now
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}

function computeCompetitiveness(myPrice: number, marketMin: number, marketMax: number): number {
  if (marketMax === marketMin) return 50
  const raw = 1 - (myPrice - marketMin) / (marketMax - marketMin)
  return Math.round(clamp(raw, 0, 1) * 100)
}

function getMonthBuckets(start: Date, end: Date): { label: string; start: Date; end: Date }[] {
  const buckets: { label: string; start: Date; end: Date }[] = []
  const cur = new Date(start)
  while (cur < end) {
    const bucketStart = new Date(cur)
    const bucketEnd = new Date(cur)
    bucketEnd.setMonth(bucketEnd.getMonth() + 1)
    buckets.push({
      label: `${bucketStart.toLocaleString('en', { month: 'short' })} ${bucketStart.getFullYear()}`,
      start: bucketStart,
      end: bucketEnd < end ? bucketEnd : end,
    })
    cur.setMonth(cur.getMonth() + 1)
  }
  return buckets
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '1m'

    const employee = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, email: true, role: true, isCompanyAdmin: true, companyId: true, createdAt: true, company: { select: { name: true, type: true } } },
    })

    if (!employee) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const isSameCompany = employee.companyId === session.user.companyId
    const isAdmin = session.user.role === 'ADMIN'
    if (!isAdmin && (!isSameCompany || !session.user.isCompanyAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const periodStart = getPeriodStart(period)
    const now = new Date()
    const buckets = getMonthBuckets(periodStart, now)

    if (employee.company.type === 'LOGISTICS') {
      // Fetch user's offers in period
      const myOffers = await prisma.offer.findMany({
        where: {
          submittedById: params.id,
          createdAt: { gte: periodStart },
        },
        include: {
          items: true,
          announcement: {
            include: {
              offers: {
                include: { items: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      if (myOffers.length === 0) {
        return NextResponse.json({
          employee,
          noData: true,
          companyType: 'LOGISTICS',
          period,
          summary: { totalOffers: 0, won: 0, lost: 0, pending: 0, winRate: 0, avgCompetitiveness: 0 },
          timeline: [],
          offerBreakdown: [],
          marketComparison: [],
        })
      }

      // Build per-offer breakdown with market comparison
      const offerBreakdown = myOffers.map((offer) => {
        // Get all offers for same announcement (market)
        const allOffers = offer.announcement.offers
        const allPrices: number[] = []
        allOffers.forEach((o) => {
          o.items.forEach((item) => allPrices.push(item.price))
        })

        const myFirstItem = offer.items[0]
        const myPrice = myFirstItem?.price ?? 0
        const marketMin = allPrices.length > 0 ? Math.min(...allPrices) : myPrice
        const marketMax = allPrices.length > 0 ? Math.max(...allPrices) : myPrice

        // Accepted price = price from accepted offer
        const acceptedOffer = allOffers.find((o) => o.status === 'ACCEPTED')
        const acceptedPrice = acceptedOffer?.items[0]?.price ?? null

        const competitiveness = computeCompetitiveness(myPrice, marketMin, marketMax)

        return {
          id: offer.id,
          announcementTitle: offer.announcement.title,
          date: offer.createdAt,
          transportType: myFirstItem?.transportType ?? 'ROAD',
          myPrice,
          currency: myFirstItem?.currency ?? 'USD',
          marketMin,
          marketMax,
          acceptedPrice,
          status: offer.status,
          competitiveness,
        }
      })

      // Timeline buckets
      const timeline = buckets.map((bucket) => {
        const bucketOffers = myOffers.filter(
          (o) => new Date(o.createdAt) >= bucket.start && new Date(o.createdAt) < bucket.end
        )
        const won = bucketOffers.filter((o) => o.status === 'ACCEPTED').length
        const total = bucketOffers.length
        const winRate = total > 0 ? Math.round((won / total) * 100) : 0

        const competitivenessScores = bucketOffers.map((offer) => {
          const bd = offerBreakdown.find((b) => b.id === offer.id)
          return bd?.competitiveness ?? 50
        })
        const avgComp = competitivenessScores.length > 0
          ? Math.round(competitivenessScores.reduce((a, b) => a + b, 0) / competitivenessScores.length)
          : 0

        return {
          label: bucket.label,
          totalOffers: total,
          won,
          winRate,
          avgCompetitiveness: avgComp,
        }
      })

      // Market comparison chart data (by announcement)
      const marketComparison = offerBreakdown.slice(-10).map((bd) => ({
        name: bd.announcementTitle.slice(0, 20),
        myPrice: bd.myPrice,
        marketMin: bd.marketMin,
        marketMax: bd.marketMax,
        acceptedPrice: bd.acceptedPrice,
        competitiveness: bd.competitiveness,
      }))

      const totalOffers = myOffers.length
      const won = myOffers.filter((o) => o.status === 'ACCEPTED').length
      const lost = myOffers.filter((o) => o.status === 'REJECTED').length
      const pending = myOffers.filter((o) => o.status === 'PENDING').length
      const winRate = totalOffers > 0 ? Math.round((won / totalOffers) * 100) : 0
      const avgCompetitiveness = offerBreakdown.length > 0
        ? Math.round(offerBreakdown.reduce((a, b) => a + b.competitiveness, 0) / offerBreakdown.length)
        : 0

      // Trend: compare first-half vs second-half winRate
      const half = Math.floor(timeline.length / 2)
      const firstHalf = timeline.slice(0, half)
      const secondHalf = timeline.slice(half)
      const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b.winRate, 0) / firstHalf.length : 0
      const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b.winRate, 0) / secondHalf.length : 0
      const diff = secondAvg - firstAvg
      const trend = diff > 5 ? 'improving' : diff < -5 ? 'declining' : 'stable'

      return NextResponse.json({
        employee,
        noData: false,
        companyType: 'LOGISTICS',
        period,
        summary: { totalOffers, won, lost, pending, winRate, avgCompetitiveness },
        timeline,
        offerBreakdown,
        marketComparison,
        trend,
      })
    } else {
      // SUPPLIER employee
      const myAnnouncements = await prisma.announcement.findMany({
        where: {
          createdById: params.id,
          createdAt: { gte: periodStart },
        },
        include: {
          offers: {
            include: { items: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      if (myAnnouncements.length === 0) {
        return NextResponse.json({
          employee,
          noData: true,
          companyType: 'SUPPLIER',
          period,
          summary: { totalAnnouncements: 0, totalOffersReceived: 0, accepted: 0, engagementRate: 0, avgOffersPerAnnouncement: 0 },
          timeline: [],
          announcementBreakdown: [],
        })
      }

      const announcementBreakdown = myAnnouncements.map((ann) => {
        const allPrices = ann.offers.flatMap((o) => o.items.map((i) => i.price))
        const minOffer = allPrices.length > 0 ? Math.min(...allPrices) : null
        const maxOffer = allPrices.length > 0 ? Math.max(...allPrices) : null
        const acceptedOffer = ann.offers.find((o) => o.status === 'ACCEPTED')
        const acceptedPrice = acceptedOffer?.items[0]?.price ?? null

        return {
          id: ann.id,
          title: ann.title,
          cargoType: ann.cargoType,
          date: ann.createdAt,
          offersCount: ann.offers.length,
          minOffer,
          maxOffer,
          acceptedPrice,
          status: ann.status,
        }
      })

      // Timeline
      const timeline = buckets.map((bucket) => {
        const bucketAnns = myAnnouncements.filter(
          (a) => new Date(a.createdAt) >= bucket.start && new Date(a.createdAt) < bucket.end
        )
        const totalOffers = bucketAnns.reduce((sum, a) => sum + a.offers.length, 0)
        const accepted = bucketAnns.reduce((sum, a) => sum + a.offers.filter((o) => o.status === 'ACCEPTED').length, 0)
        const acceptanceRate = totalOffers > 0 ? Math.round((accepted / totalOffers) * 100) : 0

        return {
          label: bucket.label,
          totalAnnouncements: bucketAnns.length,
          totalOffersReceived: totalOffers,
          accepted,
          acceptanceRate,
        }
      })

      const totalAnnouncements = myAnnouncements.length
      const totalOffersReceived = myAnnouncements.reduce((sum, a) => sum + a.offers.length, 0)
      const accepted = myAnnouncements.reduce((sum, a) => sum + a.offers.filter((o) => o.status === 'ACCEPTED').length, 0)
      const engagementRate = totalAnnouncements > 0 ? Math.round((totalOffersReceived / totalAnnouncements) * 10) / 10 : 0
      const avgOffersPerAnnouncement = engagementRate

      return NextResponse.json({
        employee,
        noData: false,
        companyType: 'SUPPLIER',
        period,
        summary: { totalAnnouncements, totalOffersReceived, accepted, engagementRate, avgOffersPerAnnouncement },
        timeline,
        announcementBreakdown,
      })
    }
  } catch (error) {
    console.error('Error fetching employee report:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
