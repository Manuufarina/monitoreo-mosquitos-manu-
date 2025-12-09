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
import React from 'react'
import { useActualizar } from '@/hooks/useActualizar'

/* 🔎 Zonas permitidas en San Isidro */
const zonasPermitidas = [
  'san isidro',
  'beccar',
  'villa adelina',
  'boulogne',
  'martinez',
  'acassuso',
]

export const esZonaValida = (address: any) => {
  const suburb = address?.suburb?.toLowerCase() || ''
  const city = address?.city?.toLowerCase() || ''
  const town = address?.town?.toLowerCase() || ''
  const village = address?.village?.toLowerCase() || ''
  const county = address?.county?.toLowerCase() || ''
  const stateDistrict = address?.state_district?.toLowerCase() || ''

  return zonasPermitidas.some(zona =>
    suburb.includes(zona) ||
    city.includes(zona) ||
    town.includes(zona) ||
    village.includes(zona) ||
    county.includes(zona) ||
    stateDistrict.includes(zona)
  )
}

export const CartelFueraMapa: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-[2000] bg-red-600 text-white px-4 py-2 rounded shadow-lg">
      ⚠️ Dirección fuera del municipio<br />
      No se guardó en la base
    </div>
  )
}

interface MapComponentProps {
  selectedLocation: { id?: number; address: string; lat: number; lng: number; ubicacion?: string } | null
  mosquitoData: any[]
  informesPorDireccion?: Record<string, any[]>
  onLocationSelect?: (lat: number, lng: number, address: string, id?: number) => void
  guardarUbicacion?: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => Promise<boolean>
  modoEdicionPin?: boolean
  posicionEditada?: { lat: number; lng: number } | null
  setPosicionEditada?: (pos: { lat: number; lng: number }) => void
  reverseActive: boolean
  flyToRequest?: { lat: number; lng: number } | null
}

export function MapComponent({
  selectedLocation,
  mosquitoData = [],
  informesPorDireccion,
  onLocationSelect,
  guardarUbicacion,
  modoEdicionPin = false,
  posicionEditada,
  setPosicionEditada,
  reverseActive,
  flyToRequest,
}: MapComponentProps) {
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [fueraMapa, setFueraMapa] = useState(false)

  const { actualizarPosicion } = useActualizar()

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  const center: [number, number] = [-34.471, -58.537]

  function ClickHandler() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng
        if (reverseActive) {
          e.target.setView([lat, lng], 18)
        } else {
          setTempPin({ lat, lng, address: 'Buscando dirección...' })
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
              { headers: { 'Accept-Language': 'es' } }
            )
            const data = await res.json()
            const addressObj = data.address

            if (!addressObj || !esZonaValida(addressObj)) {
              setTempPin({ lat, lng, address: '⚠️ Dirección fuera del municipio' })
              setFueraMapa(true)
              return
            }

            const street =
              addressObj.road ||
              addressObj.pedestrian ||
              addressObj.street ||
              'Calle desconocida'
            const number = addressObj.house_number || 'S/N'
            const fullAddress = `${street} ${number}, ${addressObj.suburb || addressObj.city || ''}`

            setTempPin({ lat, lng, address: fullAddress })
            setFueraMapa(false)

            // ❌ no pasar id=0 — deja undefined para nuevas ubicaciones
            if (onLocationSelect) onLocationSelect(lat, lng, fullAddress)

            if (guardarUbicacion) {
              await guardarUbicacion(fullAddress, lat, lng, { ovi: false, adulto: false }, '')
            }
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
    <>
      <LeafletMap
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ClickHandler />

        {flyToRequest && (
          <CameraFlyTo
            key={`${flyToRequest.lat}-${flyToRequest.lng}`}
            position={[flyToRequest.lat, flyToRequest.lng]}
          />
        )}

        {/* Pin azul persistente */}
        {selectedLocation &&
          typeof selectedLocation.lat === 'number' &&
          typeof selectedLocation.lng === 'number' && (
            <Marker
              position={
                posicionEditada
                  ? [posicionEditada.lat, posicionEditada.lng]
                  : [selectedLocation.lat, selectedLocation.lng]
              }
              draggable={modoEdicionPin}
              eventHandlers={{
                dragend: async (e) => {
                  const marker = e.target
                  const pos = marker.getLatLng()
                  setPosicionEditada?.({ lat: pos.lat, lng: pos.lng })

                  // Guardar solo si hay id válido y el modo edición está activo
                  const id = selectedLocation?.id
                  if (modoEdicionPin && id && id > 0) {
                    console.log('PATCH posición -> id:', id, 'lat:', pos.lat, 'lng:', pos.lng)
                    const ok = await actualizarPosicion(id, pos.lat, pos.lng)
                    alert(ok ? '✅ Posición actualizada en la base' : '❌ No se pudo actualizar la posición')
                  } else {
                    console.warn('dragend sin id válido o sin modoEdicionPin')
                  }
                },
              }}
            >
              <Popup>
                <strong>{selectedLocation.address?.toUpperCase()}</strong>
                <br />
                {selectedLocation.ubicacion ?? 'Sin descripción'}
              </Popup>
            </Marker>
          )}

        {/* Pin temporal */}
        {tempPin && (
          <Marker position={[tempPin.lat, tempPin.lng]}>
            <Popup>
              <strong style={{ color: '#2563eb' }}>{tempPin.address}</strong>
              <br />
              Sin descripción
            </Popup>
          </Marker>
        )}

        {/* Renderizado de trampas */}
        {Array.isArray(mosquitoData) &&
          mosquitoData.map((entry, index) => {
            const location = entry.location
            const lat = location?.lat
            const lng = location?.lng
            const address = location?.address?.toUpperCase() ?? 'Sin dirección'
            const ubicacion = entry.ubicacion ?? location?.ubicacion ?? 'Sin descripción'

            if (typeof lat !== 'number' || typeof lng !== 'number') return null

            return (
              <Marker
                key={entry.id ?? index}
                position={[lat, lng]}
                title={`${address}\n${ubicacion}`}
                eventHandlers={{
                  click: () => {
                    if (onLocationSelect) {
                      onLocationSelect(lat, lng, address, entry.id)
                    }
                  },
                }}
              >
                <Popup>
                  <strong>{address}</strong>
                  <br />
                  {ubicacion}
                </Popup>
              </Marker>
            )
          })}
      </LeafletMap>

      {fueraMapa && <CartelFueraMapa />}
    </>
  )
}
