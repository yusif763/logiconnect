"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamically import map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Shipment Route</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  ),
})

export interface ShipmentLocation {
  lat: number
  lng: number
  label: string
  timestamp?: string
  status?: string
}

interface ShipmentMapProps {
  origin: ShipmentLocation
  destination: ShipmentLocation
  currentLocation?: ShipmentLocation
  milestones?: ShipmentLocation[]
}

export function ShipmentMap(props: ShipmentMapProps) {
  return <MapWithNoSSR {...props} />
}