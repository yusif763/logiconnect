import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { announcementSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const cargoType = searchParams.get('cargoType')
    const status = searchParams.get('status')
    const mine = searchParams.get('mine')

    const where: any = {}

    if (mine === 'true' && session.user.companyId) {
      where.supplierId = session.user.companyId
    } else if (session.user.role === 'LOGISTICS_EMPLOYEE') {
      where.status = 'ACTIVE'
    }

    if (status) where.status = status
    if (origin) where.origin = { contains: origin, mode: 'insensitive' }
    if (destination) where.destination = { contains: destination, mode: 'insensitive' }
    if (cargoType) where.cargoType = { contains: cargoType, mode: 'insensitive' }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        supplier: { select: { name: true, email: true } },
        _count: { select: { offers: true } },
      },
      orderBy: { deadline: 'asc' },
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.role !== 'SUPPLIER_EMPLOYEE' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!session.user.isVerified) {
      return NextResponse.json({ error: 'Company not verified' }, { status: 403 })
    }

    const body = await request.json()
    const validated = announcementSchema.parse(body)

    const announcement = await prisma.announcement.create({
      data: {
        ...validated,
        deadline: new Date(validated.deadline),
        supplierId: session.user.companyId,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
