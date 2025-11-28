'use client'

import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { CameraFlyTo } from '@/components/CameraFlyTo'

interface MapComponentProps {
  selectedLocation: { address: string; lat: number; lng: number } | null
  mosquitoData: any[]
  informesPorDireccion: Record<string, any[]>
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  modoEdicionPin?: boolean
  posicionEditada?: { lat: number; lng: number } | null
  setPosicionEditada?: (pos: { lat: number; lng: number }) => void
  reverseActive: boolean   // 👈 estado del BotonReverse
}

export function MapComponent({
  selectedLocation,
  mosquitoData = [],
  informesPorDireccion,
  onLocationSelect,
  modoEdicionPin = false,
  posicionEditada,
  setPosicionEditada,
  reverseActive,
}: MapComponentProps) {
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number; address: string } | null>(null)

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

  // 👇 ClickHandler que usa reverseActive
  function ClickHandler() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng
        if (reverseActive) {
          // 🔵 modo zoom
          e.target.setView([lat, lng], 18)
        } else {
          // 🔴 modo pin azul
          setTempPin({ lat, lng, address: 'Buscando dirección...' })
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
              { headers: { 'Accept-Language': 'es' } }
            )
            const data = await res.json()
            const street =
              data.address?.road ||
              data.address?.pedestrian ||
              data.address?.street ||
              'Calle desconocida'
            const number = data.address?.house_number || 'S/N'
            const address = `${street} ${number}`
            setTempPin({ lat, lng, address })
            if (onLocationSelect) onLocationSelect(lat, lng, address)
          } catch (err) {
            console.error('Error en reverse geocoding:', err)
            setTempPin({ lat, lng, address: 'Error al obtener dirección' })
          }
        }
      },
    })
    return null
  }

  return (
    <LeafletMap
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}    // 👈 desactiva botones nativos
      scrollWheelZoom={true} // 👈 mantiene zoom con rueda
      doubleClickZoom={true} // 👈 mantiene zoom con doble click
      touchZoom={true}       // 👈 mantiene zoom táctil
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler />

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

      {/* 👇 Pin temporal cuando se hace click en modo pin azul */}
      {tempPin && (
        <Marker position={[tempPin.lat, tempPin.lng]}>
          <Popup>
            <strong style={{ color: '#2563eb' }}>{tempPin.address}</strong>
            <br />
            Lat: {tempPin.lat.toFixed(4)}, Lng: {tempPin.lng.toFixed(4)}
          </Popup>
        </Marker>
      )}

      {/* 👇 Renderizado de trampas desde la base */}
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
