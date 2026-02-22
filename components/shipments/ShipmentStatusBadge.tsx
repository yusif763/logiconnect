import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  BOOKED:            { label: 'Booked',              className: 'bg-blue-100 text-blue-700' },
  PICKED_UP:         { label: 'Picked Up',           className: 'bg-indigo-100 text-indigo-700' },
  IN_TRANSIT:        { label: 'In Transit',          className: 'bg-yellow-100 text-yellow-700' },
  CUSTOMS_CLEARANCE: { label: 'Customs Clearance',   className: 'bg-orange-100 text-orange-700' },
  OUT_FOR_DELIVERY:  { label: 'Out for Delivery',    className: 'bg-purple-100 text-purple-700' },
  DELIVERED:         { label: 'Delivered',           className: 'bg-green-100 text-green-700' },
}

interface ShipmentStatusBadgeProps {
  status: string
  labelOverride?: string
}

export function ShipmentStatusBadge({ status, labelOverride }: ShipmentStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-600' }
  return (
    <Badge className={cn('font-medium shrink-0', config.className)}>
      {labelOverride ?? config.label}
    </Badge>
  )
}
