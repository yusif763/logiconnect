import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        announcement: {
          include: {
            supplier: { select: { id: true, name: true, email: true } },
          },
        },
        logisticsCompany: { select: { id: true, name: true, email: true } },
        items: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error fetching offer:', error)
    return NextResponse.json({ error: 'Failed to fetch offer' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { notes, items } = body

    // Fetch the offer to verify ownership and status
    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        announcement: true,
        logisticsCompany: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Check if user is from the logistics company that created the offer
    if (offer.logisticsCompanyId !== session.user.companyId) {
      return NextResponse.json(
        { error: 'You can only edit your own offers' },
        { status: 403 }
      )
    }

    // Check if offer is still in PENDING status
    if (offer.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending offers can be edited' },
        { status: 400 }
      )
    }

    // Use transaction to update offer and create history
    const updatedOffer = await prisma.$transaction(async (tx) => {
      // Get current items before deletion for history
      const oldItems = await tx.offerItem.findMany({
        where: { offerId: params.id },
      })

      // Store old values for history
      const changeDetails = {
        oldNotes: offer.notes,
        newNotes: notes,
        oldItems: oldItems.map(item => ({
          transportType: item.transportType,
          price: item.price,
          currency: item.currency,
          deliveryDays: item.deliveryDays,
          notes: item.notes,
        })),
        newItems: items.map((item: any) => ({
          transportType: item.transportType,
          price: item.price,
          currency: item.currency || 'USD',
          deliveryDays: item.deliveryDays,
          notes: item.notes,
        })),
      }

      // Delete existing items
      await tx.offerItem.deleteMany({
        where: { offerId: params.id },
      })

      // Update offer with new notes and items
      const updated = await tx.offer.update({
        where: { id: params.id },
        data: {
          notes,
          items: {
            create: items.map((item: any) => ({
              transportType: item.transportType,
              price: item.price,
              currency: item.currency || 'USD',
              deliveryDays: item.deliveryDays,
              notes: item.notes,
            })),
          },
        },
        include: {
          announcement: {
            include: {
              supplier: { select: { id: true, name: true, email: true } },
            },
          },
          logisticsCompany: { select: { id: true, name: true, email: true } },
          items: true,
        },
      })

      // Create history record with change details
      await tx.offerHistory.create({
        data: {
          offerId: params.id,
          action: 'UPDATED',
          changedBy: session.user.id,
          note: JSON.stringify(changeDetails),
        },
      })

      return updated
    })

    return NextResponse.json(updatedOffer)
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }
}
