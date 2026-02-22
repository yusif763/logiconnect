import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
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
            announcement: {
              select: {
                title: true,
                origin: true,
                destination: true,
                cargoType: true,
                weight: true,
                supplierId: true,
                supplier: { select: { name: true } },
              },
            },
            logisticsCompany: { select: { id: true, name: true } },
          },
        },
        milestones: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { companyId, role } = session.user
    const isSupplier = shipment.offer.announcement.supplierId === companyId
    const isLogistics = shipment.offer.logisticsCompany.id === companyId

    if (role !== 'ADMIN' && !isSupplier && !isLogistics) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(shipment)
  } catch (error) {
    console.error('Error fetching shipment:', error)
    return NextResponse.json({ error: 'Failed to fetch shipment' }, { status: 500 })
  }
}
