import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: number
  className?: string
}

export function StatsCard({ title, value, icon: Icon, description, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
            {trend !== undefined && (
              <p className={cn(
                'text-xs font-medium mt-1',
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {trend >= 0 ? '+' : ''}{trend}% vs last month
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
