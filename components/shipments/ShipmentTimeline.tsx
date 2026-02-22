import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const STEPS = [
  { status: 'BOOKED',            label: 'Booked' },
  { status: 'PICKED_UP',         label: 'Picked Up' },
  { status: 'IN_TRANSIT',        label: 'In Transit' },
  { status: 'CUSTOMS_CLEARANCE', label: 'Customs Clearance' },
  { status: 'OUT_FOR_DELIVERY',  label: 'Out for Delivery' },
  { status: 'DELIVERED',         label: 'Delivered' },
]

const STATUS_ORDER = STEPS.map((s) => s.status)

interface Milestone {
  status: string
  note?: string | null
  location?: string | null
  createdAt: string
}

interface ShipmentTimelineProps {
  currentStatus: string
  milestones: Milestone[]
}

export function ShipmentTimeline({ currentStatus, milestones }: ShipmentTimelineProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus)

  const milestoneMap: Record<string, Milestone> = {}
  milestones.forEach((m) => {
    milestoneMap[m.status] = m
  })

  return (
    <div className="relative">
      {STEPS.map((step, idx) => {
        const isDone = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isFuture = idx > currentIdx
        const milestone = milestoneMap[step.status]

        return (
          <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-all',
                  isDone && 'bg-blue-600 border-blue-600',
                  isCurrent && 'bg-white border-blue-600 ring-4 ring-blue-100 animate-pulse',
                  isFuture && 'bg-white border-slate-200'
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-white" />
                ) : isCurrent ? (
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                )}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 mt-1',
                    idx < currentIdx ? 'bg-blue-600' : 'bg-slate-200'
                  )}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>

            {/* Content column */}
            <div className="pt-1 pb-2 min-w-0">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isFuture ? 'text-slate-400' : 'text-slate-900'
                )}
              >
                {step.label}
              </p>
              {milestone && (
                <div className="mt-0.5 space-y-0.5">
                  {milestone.location && (
                    <p className="text-xs text-slate-500">📍 {milestone.location}</p>
                  )}
                  {milestone.note && (
                    <p className="text-xs text-slate-500 italic">{milestone.note}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {new Date(milestone.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
