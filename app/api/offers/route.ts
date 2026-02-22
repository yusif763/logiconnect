import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { offerSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const announcementId = searchParams.get('announcementId')

    const where: any = {}

    if (session.user.role === 'LOGISTICS_EMPLOYEE') {
      where.logisticsCompanyId = session.user.companyId
    } else if (session.user.role === 'SUPPLIER_EMPLOYEE') {
      where.announcement = { supplierId: session.user.companyId }
    }

    if (announcementId) where.announcementId = announcementId

    const offers = await prisma.offer.findMany({
      where,
      include: {
        announcement: {
          select: { id: true, title: true, origin: true, destination: true },
        },
        logisticsCompany: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'LOGISTICS_EMPLOYEE' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!session.user.isVerified) {
      return NextResponse.json({ error: 'Company not verified' }, { status: 403 })
    }

    const body = await request.json()
    const validated = offerSchema.parse(body)

    // Check if already submitted
    const existing = await prisma.offer.findUnique({
      where: {
        announcementId_logisticsCompanyId: {
          announcementId: validated.announcementId,
          logisticsCompanyId: session.user.companyId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already submitted an offer for this announcement' }, { status: 400 })
    }

    // Check announcement is active and get supplier users for notifications
    const announcement = await prisma.announcement.findUnique({
      where: { id: validated.announcementId },
      include: { supplier: { include: { users: { select: { id: true } } } } },
    })

    if (!announcement || announcement.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Announcement is not active' }, { status: 400 })
    }

    const offer = await prisma.offer.create({
      data: {
        announcementId: validated.announcementId,
        logisticsCompanyId: session.user.companyId,
        notes: validated.notes,
        submittedById: session.user.id,
        items: { create: validated.items },
      },
      include: { items: true, logisticsCompany: { select: { name: true } } },
    })

    // Notify all supplier employees
    await prisma.notification.createMany({
      data: announcement.supplier.users.map((u: any) => ({
        userId: u.id,
        type: 'NEW_OFFER' as const,
        title: 'New offer received',
        body: `${(offer as any).logisticsCompany.name} submitted an offer for "${announcement.title}"`,
        relatedId: announcement.id,
      })),
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating offer:', error)
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 })
  }
}
