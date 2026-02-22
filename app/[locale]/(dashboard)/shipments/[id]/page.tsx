'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, MapPin, Package, Building2, Weight } from 'lucide-react'
import { ShipmentStatusBadge } from '@/components/shipments/ShipmentStatusBadge'
import { ShipmentTimeline } from '@/components/shipments/ShipmentTimeline'
import { UpdateMilestoneDialog } from '@/components/shipments/UpdateMilestoneDialog'

export default function ShipmentDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const locale = params.locale as string
  const id = params.id as string

  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchShipment = useCallback(async () => {
    const res = await fetch(`/api/shipments/${id}`)
    const data = await res.json()
    setShipment(data)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchShipment() }, [fetchShipment])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!shipment || shipment.error) {
    return <p className="text-slate-500 py-8 text-center">Shipment not found.</p>
  }

  const ann = shipment.offer?.announcement
  const logistics = shipment.offer?.logisticsCompany
  const isLogistics = session?.user?.companyId === logistics?.id

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/shipments`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Link>
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{ann?.title}</h1>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {ann?.origin} → {ann?.destination}
              </div>
            </div>
            <ShipmentStatusBadge status={shipment.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Package className="h-4 w-4 text-slate-400" />
              <span>{ann?.cargoType}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Weight className="h-4 w-4 text-slate-400" />
              <span>{ann?.weight?.toLocaleString()} kg</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{logistics?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>Supplier: {ann?.supplier?.name}</span>
          </div>

          {isLogistics && shipment.status !== 'DELIVERED' && (
            <div className="mt-4 pt-4 border-t">
              <UpdateMilestoneDialog
                shipmentId={shipment.id}
                currentStatus={shipment.status}
                onUpdated={fetchShipment}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tracking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentTimeline
            currentStatus={shipment.status}
            milestones={shipment.milestones ?? []}
          />
        </CardContent>
      </Card>

      {/* Milestone history */}
      {shipment.milestones?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Update History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...shipment.milestones].reverse().map((m: any) => (
                <div key={m.id} className="flex gap-3 text-sm border-b last:border-0 pb-3 last:pb-0">
                  <ShipmentStatusBadge status={m.status} />
                  <div className="min-w-0">
                    {m.location && <p className="text-slate-600">📍 {m.location}</p>}
                    {m.note && <p className="text-slate-500 italic">{m.note}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(m.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
