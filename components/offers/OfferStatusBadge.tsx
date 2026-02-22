import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
  ACCEPTED: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Accepted' },
  REJECTED: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' },
}

interface OfferStatusBadgeProps {
  status: string
  label?: string
}

export function OfferStatusBadge({ status, label }: OfferStatusBadgeProps) {
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-600', label: status }
  return (
    <Badge className={cn('text-xs', config.color)}>
      {label || config.label}
    </Badge>
  )
}
