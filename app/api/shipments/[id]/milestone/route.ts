import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const STATUS_ORDER = [
  'BOOKED',
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS_CLEARANCE',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const

type ShipmentStatus = typeof STATUS_ORDER[number]

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      include: {
        offer: {
          include: {
            logisticsCompany: { select: { id: true } },
          },
        },
      },
    })

    if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only logistics company of the offer can add milestones
    const isLogistics = shipment.offer.logisticsCompany.id === session.user.companyId
    if (!isLogistics && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (shipment.status === 'DELIVERED') {
      return NextResponse.json({ error: 'Shipment already delivered' }, { status: 400 })
    }

    const { status, note, location } = await request.json()

    if (!STATUS_ORDER.includes(status as ShipmentStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const currentIdx = STATUS_ORDER.indexOf(shipment.status as ShipmentStatus)
    const newIdx = STATUS_ORDER.indexOf(status as ShipmentStatus)

    if (newIdx <= currentIdx) {
      return NextResponse.json(
        { error: 'Status must progress forward' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const milestone = await tx.shipmentMilestone.create({
        data: { shipmentId: params.id, status, note, location },
      })
      await tx.shipment.update({
        where: { id: params.id },
        data: { status },
      })
      return milestone
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error adding milestone:', error)
    return NextResponse.json({ error: 'Failed to add milestone' }, { status: 500 })
  }
}
