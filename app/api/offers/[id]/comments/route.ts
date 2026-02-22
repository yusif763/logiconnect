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

    const offer = await prisma.offer.findUnique({
      where: { id: params.id },
      include: { announcement: { select: { supplierId: true } } },
    })
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { companyId, role } = session.user
    const isSupplier = offer.announcement.supplierId === companyId
    const isLogistics = offer.logisticsCompanyId === companyId
    if (role !== 'ADMIN' && !isSupplier && !isLogistics) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const comments = await prisma.offerComment.findMany({
      where: { offerId: params.id },
      include: { author: { select: { id: true, name: true, role: true, companyId: true } } },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(
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
          include: { supplier: { include: { users: { select: { id: true } } } } },
        },
        logisticsCompany: { include: { users: { select: { id: true } } } },
      },
    })
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { companyId, role, id: userId, name } = session.user
    const isSupplier = offer.announcement.supplierId === companyId
    const isLogistics = offer.logisticsCompanyId === companyId
    if (role !== 'ADMIN' && !isSupplier && !isLogistics) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { content } = await request.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const comment = await prisma.offerComment.create({
      data: { offerId: params.id, authorId: userId, content: content.trim() },
      include: { author: { select: { id: true, name: true, role: true, companyId: true } } },
    })

    // Notify the other party
    const notifyUserIds: string[] = isSupplier
      ? offer.logisticsCompany.users.map((u: any) => u.id).filter((id: string) => id !== userId)
      : offer.announcement.supplier.users.map((u: any) => u.id).filter((id: string) => id !== userId)

    if (notifyUserIds.length > 0) {
      await prisma.notification.createMany({
        data: notifyUserIds.map((uid) => ({
          userId: uid,
          type: 'NEW_COMMENT' as const,
          title: 'New comment on offer',
          body: `${name}: "${content.trim().slice(0, 80)}${content.length > 80 ? '…' : ''}"`,
          relatedId: params.id,
        })),
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
