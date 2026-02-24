"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ShipmentLocation } from "./ShipmentMap"

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const OriginIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const DestinationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const CurrentLocationIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MapComponentProps {
  origin: ShipmentLocation
  destination: ShipmentLocation
  currentLocation?: ShipmentLocation
  milestones?: ShipmentLocation[]
}

export default function MapComponent({
  origin,
  destination,
  currentLocation,
  milestones = [],
}: MapComponentProps) {
  const center: [number, number] = [
    (origin.lat + destination.lat) / 2,
    (origin.lng + destination.lng) / 2,
  ]

  // Create route line
  const routePositions: [number, number][] = [
    [origin.lat, origin.lng],
    ...(currentLocation ? [[currentLocation.lat, currentLocation.lng] as [number, number]] : []),
    ...milestones.map((m) => [m.lat, m.lng] as [number, number]),
    [destination.lat, destination.lng],
  ]

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <CardTitle>Shipment Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-lg overflow-hidden border">
          <MapContainer
            center={center}
            zoom={6}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Origin Marker */}
            <Marker position={[origin.lat, origin.lng]} icon={OriginIcon}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">Origin</p>
                  <p className="text-sm">{origin.label}</p>
                  {origin.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(origin.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={[destination.lat, destination.lng]} icon={DestinationIcon}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold">Destination</p>
                  <p className="text-sm">{destination.label}</p>
                  {destination.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(destination.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>

            {/* Current Location Marker */}
            {currentLocation && (
              <Marker
                position={[currentLocation.lat, currentLocation.lng]}
                icon={CurrentLocationIcon}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">Current Location</p>
                    <p className="text-sm">{currentLocation.label}</p>
                    {currentLocation.status && (
                      <Badge variant="secondary" className="text-xs">
                        {currentLocation.status}
                      </Badge>
                    )}
                    {currentLocation.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(currentLocation.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Milestone Markers */}
            {milestones.map((milestone, index) => (
              <Marker
                key={index}
                position={[milestone.lat, milestone.lng]}
                icon={DefaultIcon}
              >
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">Milestone {index + 1}</p>
                    <p className="text-sm">{milestone.label}</p>
                    {milestone.status && (
                      <Badge variant="secondary" className="text-xs">
                        {milestone.status}
                      </Badge>
                    )}
                    {milestone.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(milestone.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Line */}
            <Polyline
              positions={routePositions}
              color="#3b82f6"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          </MapContainer>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Milestone</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}