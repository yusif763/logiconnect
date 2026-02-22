import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const role = searchParams.get('role')

    const where: any = {}
    if (companyId) where.companyId = companyId
    if (role) where.role = role

    const users = await prisma.user.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const safeUsers = users.map(({ password: _pw, ...user }: any) => user)
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
