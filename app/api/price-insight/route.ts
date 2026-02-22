import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const transportType = searchParams.get('transportType')
    const cargoType = searchParams.get('cargoType') || ''
    const origin = searchParams.get('origin') || ''
    const destination = searchParams.get('destination') || ''

    if (!transportType) {
      return NextResponse.json({ error: 'transportType is required' }, { status: 400 })
    }

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    // Get all offer items of this transport type on matching announcements (last 90 days)
    const allItems = await prisma.offerItem.findMany({
      where: {
        transportType: transportType as any,
        offer: {
          createdAt: { gte: ninetyDaysAgo },
          announcement: {
            ...(cargoType ? { cargoType: { contains: cargoType, mode: 'insensitive' } } : {}),
            ...(origin ? { origin: { contains: origin, mode: 'insensitive' } } : {}),
            ...(destination ? { destination: { contains: destination, mode: 'insensitive' } } : {}),
          },
        },
      },
      include: {
        offer: { select: { status: true } },
      },
    })

    if (allItems.length === 0) {
      return NextResponse.json({ noData: true, offersAnalyzed: 0 })
    }

    const prices = allItems.map((i) => i.price)
    const marketMin = Math.min(...prices)
    const marketMax = Math.max(...prices)
    const marketAverage = prices.reduce((a, b) => a + b, 0) / prices.length

    const acceptedItems = allItems.filter((i) => i.offer.status === 'ACCEPTED')
    const winningAverage =
      acceptedItems.length > 0
        ? acceptedItems.reduce((a, b) => a + b.price, 0) / acceptedItems.length
        : marketAverage

    // Win rate: what fraction of all offers in this segment were accepted
    const totalOffers = allItems.length
    const acceptedOffers = acceptedItems.length
    const winRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0

    return NextResponse.json({
      noData: false,
      marketMin: Math.round(marketMin),
      marketMax: Math.round(marketMax),
      marketAverage: Math.round(marketAverage),
      winningAverage: Math.round(winningAverage),
      offersAnalyzed: totalOffers,
      winRate,
    })
  } catch (error) {
    console.error('Error fetching price insight:', error)
    return NextResponse.json({ error: 'Failed to fetch price insight' }, { status: 500 })
  }
}
