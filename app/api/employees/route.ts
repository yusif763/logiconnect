import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createEmployeeSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = session.user.role === 'ADMIN'
    const isCompanyAdmin = session.user.isCompanyAdmin

    if (!isAdmin && !isCompanyAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where = isAdmin ? {} : { companyId: session.user.companyId }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isCompanyAdmin: true,
        companyId: true,
        createdAt: true,
        company: { select: { name: true, type: true } },
        _count: {
          select: {
            submittedOffers: true,
            createdAnnouncements: true,
          },
        },
        submittedOffers: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const usersWithStats = users.map((user) => {
      const totalOffers = user._count.submittedOffers
      const wonOffers = user.submittedOffers.filter((o) => o.status === 'ACCEPTED').length
      const winRate = totalOffers > 0 ? Math.round((wonOffers / totalOffers) * 100) : 0

      const totalAnnouncements = user._count.createdAnnouncements
      const acceptedOffers = user.submittedOffers.filter((o) => o.status === 'ACCEPTED').length

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isCompanyAdmin: user.isCompanyAdmin,
        companyId: user.companyId,
        companyName: user.company.name,
        companyType: user.company.type,
        createdAt: user.createdAt,
        totalOffers,
        winRate,
        totalAnnouncements,
        acceptedOffers,
      }
    })

    return NextResponse.json(usersWithStats)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!session.user.isCompanyAdmin && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createEmployeeSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12)

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: company.type === 'SUPPLIER' ? 'SUPPLIER_EMPLOYEE' : 'LOGISTICS_EMPLOYEE',
        isCompanyAdmin: false,
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isCompanyAdmin: true,
        createdAt: true,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}
