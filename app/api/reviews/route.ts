import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import db from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { logisticsCompanyId, rating, serviceQuality, communication, timeliness, comment } =
      await req.json()

    // Validate ratings
    if (
      !rating ||
      !serviceQuality ||
      !communication ||
      !timeliness ||
      rating < 1 ||
      rating > 5 ||
      serviceQuality < 1 ||
      serviceQuality > 5 ||
      communication < 1 ||
      communication > 5 ||
      timeliness < 1 ||
      timeliness > 5
    ) {
      return NextResponse.json(
        { message: 'Invalid rating values. Ratings must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if company exists and is a logistics company
    const company = await db.company.findUnique({
      where: { id: logisticsCompanyId },
    })

    if (!company || company.type !== 'LOGISTICS') {
      return NextResponse.json(
        { message: 'Logistics company not found' },
        { status: 404 }
      )
    }

    // Check if user already reviewed this company
    const existingReview = await db.review.findUnique({
      where: {
        logisticsCompanyId_reviewerId: {
          logisticsCompanyId,
          reviewerId: session.user.id,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const review = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          serviceQuality,
          communication,
          timeliness,
          comment: comment || null,
        },
        include: {
          reviewer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json(review)
    } else {
      // Create new review
      const review = await db.review.create({
        data: {
          logisticsCompanyId,
          reviewerId: session.user.id,
          rating,
          serviceQuality,
          communication,
          timeliness,
          comment: comment || null,
        },
        include: {
          reviewer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json(review, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { message: 'Company ID is required' },
        { status: 400 }
      )
    }

    const reviews = await db.review.findMany({
      where: {
        logisticsCompanyId: companyId,
      },
      include: {
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate statistics
    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0

    const ratingBreakdown = {
      1: reviews.filter((r) => r.rating === 1).length,
      2: reviews.filter((r) => r.rating === 2).length,
      3: reviews.filter((r) => r.rating === 3).length,
      4: reviews.filter((r) => r.rating === 4).length,
      5: reviews.filter((r) => r.rating === 5).length,
    }

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews,
      ratingBreakdown,
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}