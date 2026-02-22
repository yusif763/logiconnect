'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STATUS_ORDER = [
  'BOOKED',
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS_CLEARANCE',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
] as const

const STATUS_LABELS: Record<string, string> = {
  BOOKED:            'Booked',
  PICKED_UP:         'Picked Up',
  IN_TRANSIT:        'In Transit',
  CUSTOMS_CLEARANCE: 'Customs Clearance',
  OUT_FOR_DELIVERY:  'Out for Delivery',
  DELIVERED:         'Delivered',
}

interface UpdateMilestoneDialogProps {
  shipmentId: string
  currentStatus: string
  onUpdated: () => void
}

export function UpdateMilestoneDialog({
  shipmentId,
  currentStatus,
  onUpdated,
}: UpdateMilestoneDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')

  const currentIdx = STATUS_ORDER.indexOf(currentStatus as any)
  const availableStatuses = STATUS_ORDER.slice(currentIdx + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!status) return

    setLoading(true)
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/milestone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, location: location || undefined, note: note || undefined }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast({ title: json.error || 'Failed to update milestone', variant: 'destructive' })
        return
      }

      toast({ title: 'Shipment milestone updated' })
      setOpen(false)
      setStatus('')
      setLocation('')
      setNote('')
      onUpdated()
    } catch {
      toast({ title: 'Failed to update milestone', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (availableStatuses.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MapPin className="h-4 w-4 mr-2" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>New Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select next status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location (optional)</Label>
            <Input
              className="mt-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Frankfurt Airport"
            />
          </div>
          <div>
            <Label>Note (optional)</Label>
            <Textarea
              className="mt-1"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional information..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!status || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
