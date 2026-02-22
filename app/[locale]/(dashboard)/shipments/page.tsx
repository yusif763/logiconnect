'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, MapPin, Package, ArrowRight } from 'lucide-react'
import { ShipmentStatusBadge } from '@/components/shipments/ShipmentStatusBadge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const STATUS_ORDER = [
  'BOOKED', 'PICKED_UP', 'IN_TRANSIT', 'CUSTOMS_CLEARANCE', 'OUT_FOR_DELIVERY', 'DELIVERED',
]

function progressPercent(status: string) {
  const idx = STATUS_ORDER.indexOf(status)
  return Math.round(((idx + 1) / STATUS_ORDER.length) * 100)
}

export default function ShipmentsPage() {
  const params = useParams()
  const locale = params.locale as string

  const [shipments, setShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    fetch('/api/shipments')
      .then((r) => r.json())
      .then((data) => { setShipments(data); setLoading(false) })
  }, [])

  const filtered = shipments.filter((s) => {
    if (tab === 'active') return s.status !== 'DELIVERED'
    if (tab === 'delivered') return s.status === 'DELIVERED'
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Shipments</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({shipments.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({shipments.filter((s) => s.status !== 'DELIVERED').length})
          </TabsTrigger>
          <TabsTrigger value="delivered">
            Delivered ({shipments.filter((s) => s.status === 'DELIVERED').length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p>No shipments found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((shipment) => {
            const pct = progressPercent(shipment.status)
            const ann = shipment.offer?.announcement
            const lastMilestone = shipment.milestones?.[0]

            return (
              <Link key={shipment.id} href={`/${locale}/shipments/${shipment.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">
                            {ann?.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          {ann?.origin}
                          <ArrowRight className="h-3.5 w-3.5" />
                          {ann?.destination}
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>
                              {lastMilestone
                                ? `Last update: ${new Date(lastMilestone.createdAt).toLocaleDateString()}`
                                : 'No updates yet'}
                            </span>
                            <span>{pct}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <ShipmentStatusBadge status={shipment.status} />
                        <span className="text-xs text-slate-400">
                          {shipment.offer?.logisticsCompany?.name}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
