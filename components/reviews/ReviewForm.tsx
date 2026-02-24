"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { StarRating } from "@/components/ui/star-rating"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  serviceQuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  timeliness: z.number().min(1).max(5),
  comment: z.string().optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  companyId: string
  companyName: string
  onSubmitSuccess?: () => void
}

export function ReviewForm({
  companyId,
  companyName,
  onSubmitSuccess,
}: ReviewFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [ratings, setRatings] = React.useState({
    rating: 0,
    serviceQuality: 0,
    communication: 0,
    timeliness: 0,
  })

  const [comment, setComment] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (ratings.rating === 0) {
      toast({
        title: "Error",
        description: "Please provide an overall rating",
        variant: "destructive",
      })
      return
    }

    if (
      ratings.serviceQuality === 0 ||
      ratings.communication === 0 ||
      ratings.timeliness === 0
    ) {
      toast({
        title: "Error",
        description: "Please rate all criteria",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logisticsCompanyId: companyId,
          ...ratings,
          comment: comment || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit review")
      }

      toast({
        title: "Success",
        description: "Your review has been submitted",
      })

      // Reset form
      setRatings({
        rating: 0,
        serviceQuality: 0,
        communication: 0,
        timeliness: 0,
      })
      setComment("")

      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <CardTitle>Rate {companyName}</CardTitle>
        <CardDescription>
          Share your experience with this logistics company
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <StarRating
                rating={ratings.rating}
                onRatingChange={(value) =>
                  setRatings((prev) => ({ ...prev, rating: value }))
                }
                size="lg"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Service Quality</Label>
                <StarRating
                  rating={ratings.serviceQuality}
                  onRatingChange={(value) =>
                    setRatings((prev) => ({ ...prev, serviceQuality: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Communication</Label>
                <StarRating
                  rating={ratings.communication}
                  onRatingChange={(value) =>
                    setRatings((prev) => ({ ...prev, communication: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Timeliness</Label>
                <StarRating
                  rating={ratings.timeliness}
                  onRatingChange={(value) =>
                    setRatings((prev) => ({ ...prev, timeliness: value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share more details about your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full hover-lift"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}