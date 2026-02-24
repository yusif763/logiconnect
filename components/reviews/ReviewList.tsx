"use client"

import * as React from "react"
import { StarRating, RatingBreakdown } from "@/components/ui/star-rating"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface Review {
  id: string
  rating: number
  serviceQuality: number
  communication: number
  timeliness: number
  comment?: string
  reviewer: {
    name: string
    email: string
  }
  createdAt: string
}

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  ratingBreakdown: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown,
}: ReviewListProps) {
  return (
    <div className="space-y-6 animate-slide-up">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                  <StarRating rating={averageRating} readonly size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Average rating
                  </p>
                </div>
              </div>
            </div>
            <div>
              <RatingBreakdown
                ratings={ratingBreakdown}
                totalReviews={totalReviews}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No reviews yet. Be the first to review!
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="glass-card hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {review.reviewer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.reviewer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(review.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} readonly />
                </div>

                <div className="flex gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    Service: {review.serviceQuality}/5
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Communication: {review.communication}/5
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Timeliness: {review.timeliness}/5
                  </Badge>
                </div>

                {review.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}