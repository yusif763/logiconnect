import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { companyId, role } = session.user

    let where: any = {}

    if (role === 'SUPPLIER_EMPLOYEE') {
      where = {
        offer: {
          announcement: { supplierId: companyId },
        },
      }
    } else if (role === 'LOGISTICS_EMPLOYEE') {
      where = {
        offer: { logisticsCompanyId: companyId },
      }
    }
    // ADMIN sees all (no where clause)

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        offer: {
          include: {
            announcement: { select: { title: true, origin: true, destination: true, cargoType: true } },
            logisticsCompany: { select: { name: true } },
          },
        },
        milestones: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(shipments)
  } catch (error) {
    console.error('Error fetching shipments:', error)
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 })
  }
}
