import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: {
        announcement: { select: { id: true, title: true, supplierId: true } },
        logisticsCompany: { include: { users: { select: { id: true } } } },
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Only the supplier of the announcement can change offer status
    if (offer.announcement.supplierId !== session.user.companyId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status } = await request.json()

    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Allow changing status even if already accepted/rejected
    // This gives flexibility to suppliers to change their mind

    const result = await prisma.$transaction(async (tx: any) => {
      // Create history record
      await tx.offerHistory.create({
        data: {
          offerId: params.id,
          action: 'STATUS_CHANGED',
          oldStatus: offer.status,
          newStatus: status,
          changedBy: session.user.id,
          note: `Status changed from ${offer.status} to ${status}`,
        },
      })

      const updatedOffer = await tx.offer.update({
        where: { id: params.id },
        data: { status },
      })

      // If accepted, close the announcement and create a shipment
      if (status === 'ACCEPTED') {
        // Reject all other pending offers for this announcement
        const rejectedOffers = await tx.offer.findMany({
          where: {
            announcementId: offer.announcement.id,
            id: { not: params.id },
            status: 'PENDING',
          },
        })

        for (const rejectedOffer of rejectedOffers) {
          await tx.offerHistory.create({
            data: {
              offerId: rejectedOffer.id,
              action: 'STATUS_CHANGED',
              oldStatus: 'PENDING',
              newStatus: 'REJECTED',
              changedBy: session.user.id,
              note: 'Auto-rejected: Another offer was accepted',
            },
          })
        }

        await tx.offer.updateMany({
          where: {
            announcementId: offer.announcement.id,
            id: { not: params.id },
            status: 'PENDING',
          },
          data: { status: 'REJECTED' },
        })

        // Close the announcement
        await tx.announcement.update({
          where: { id: offer.announcement.id },
          data: { status: 'CLOSED' },
        })

        // Auto-create shipment if not already exists
        const existing = await tx.shipment.findUnique({ where: { offerId: params.id } })
        if (!existing) {
          await tx.shipment.create({
            data: {
              offerId: params.id,
              status: 'BOOKED',
              milestones: {
                create: [{ status: 'BOOKED', note: 'Offer accepted, shipment booked' }],
              },
            },
          })
        }
      }

      return updatedOffer
    })

    // Notify logistics company employees
    const logisticsUserIds = offer.logisticsCompany.users.map((u: any) => u.id)
    if (logisticsUserIds.length > 0) {
      await prisma.notification.createMany({
        data: logisticsUserIds.map((uid: string) => ({
          userId: uid,
          type: status === 'ACCEPTED' ? 'OFFER_ACCEPTED' as const : 'OFFER_REJECTED' as const,
          title: status === 'ACCEPTED' ? 'Offer accepted! 🎉' : 'Offer not selected',
          body: status === 'ACCEPTED'
            ? `Your offer for "${offer.announcement.title}" was accepted. Check shipment details.`
            : `Your offer for "${offer.announcement.title}" was not selected.`,
          relatedId: params.id,
        })),
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating offer status:', error)
    return NextResponse.json({ error: 'Failed to update offer status' }, { status: 500 })
  }
}
