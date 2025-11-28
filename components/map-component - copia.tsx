'use client'

import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import { CameraFlyTo } from '@/components/CameraFlyTo'

interface MapComponentProps {
  selectedLocation: { address: string; lat: number; lng: number } | null
  mosquitoData: any[]
  informesPorDireccion: Record<string, any[]>
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  modoEdicionPin?: boolean
  posicionEditada?: { lat: number; lng: number } | null
  setPosicionEditada?: (pos: { lat: number; lng: number }) => void
}

export function MapComponent({
  selectedLocation,
  mosquitoData = [],
  informesPorDireccion,
  onLocationSelect,
  modoEdicionPin = false,
  posicionEditada,
  setPosicionEditada,
}: MapComponentProps) {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  const center = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : [-34.471, -58.537] // San Isidro por defecto

  return (
    <LeafletMap center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* 👇 Pin azul persistente para selectedLocation */}
      {selectedLocation && (
        <>
          <CameraFlyTo
            key={`${selectedLocation.lat}-${selectedLocation.lng}`}
            position={[selectedLocation.lat, selectedLocation.lng]}
          />
          <Marker
            position={
              posicionEditada
                ? [posicionEditada.lat, posicionEditada.lng]
                : [selectedLocation.lat, selectedLocation.lng]
            }
            draggable={modoEdicionPin}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target
                const pos = marker.getLatLng()
                if (setPosicionEditada) {
                  setPosicionEditada({ lat: pos.lat, lng: pos.lng })
                }
              },
            }}
          >
            <Popup>
              <strong>{selectedLocation.address}</strong>
              <br />
              Lat: {(posicionEditada?.lat ?? selectedLocation.lat).toFixed(4)},
              Lng: {(posicionEditada?.lng ?? selectedLocation.lng).toFixed(4)}
            </Popup>
          </Marker>
        </>
      )}

      {/* 👇 Renderizado de trampas desde la base (estructura original) */}
      {Array.isArray(mosquitoData) &&
        mosquitoData.map((entry, index) => {
          const location = entry.location
          const lat = location?.lat
          const lng = location?.lng
          const address = location?.address ?? 'Sin dirección'
          const cantidad = (informesPorDireccion?.[address]?.length) ?? 0

          if (typeof lat !== 'number' || typeof lng !== 'number') return null

          return (
            <Marker
              key={entry.id ?? index}
              position={[lat, lng]}
              title={`${address}\n${cantidad} informe${cantidad !== 1 ? 's' : ''}`}
              eventHandlers={{
                click: () => {
                  if (onLocationSelect) {
                    onLocationSelect(lat, lng, address)
                  }
                },
              }}
            >
              <Popup>
                <strong>{address}</strong>
                <br />
                {cantidad} informe{cantidad !== 1 ? 's' : ''}
              </Popup>
            </Marker>
          )
        })}
    </LeafletMap>
  )
}
