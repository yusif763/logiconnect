import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const verified = searchParams.get('verified')

    const where: any = {}
    if (type) where.type = type
    if (verified !== null && verified !== '') where.isVerified = verified === 'true'

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: { select: { users: true, announcements: true, offers: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
