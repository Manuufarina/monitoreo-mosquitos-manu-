'use client'

import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { filtrarCalleAltura, guardarDireccion } from '@/components/vista-mapa/LogicaDirecciones'
import { esZonaValida, CartelFueraMapa } from '@/components/map-component'
import { useState } from 'react'

interface BotonReverseProps {
  reverseActive: boolean
  onToggle: (active: boolean) => void
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean }
  ) => Promise<boolean>
  selectedLocation: { address: string; lat: number; lng: number } | null
  onLocationSelect: (lat: number, lng: number, address: string) => void
}

export function BotonReverse({
  reverseActive,
  onToggle,
  guardarUbicacion,
  selectedLocation,
  onLocationSelect,
}: BotonReverseProps) {
  const [fueraMapa, setFueraMapa] = useState(false)

  const handleClick = async () => {
    const nextState = !reverseActive
    onToggle(nextState)

    if (!nextState && selectedLocation) {
      try {
        // 🚨 Reverse geocoding para obtener detalles reales
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation.lat}&lon=${selectedLocation.lng}&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        )
        const data = await response.json()
        const addressObj = data.address

        // 🔎 Validación con esZonaValida
        if (!addressObj || !esZonaValida(addressObj)) {
          setFueraMapa(true)
          return
        }

        // 👇 Construir dirección legible
        const street =
          addressObj.road ||
          addressObj.pedestrian ||
          addressObj.street ||
          'Calle desconocida'
        const number = addressObj.house_number || 'S/N'
        const fullAddress = `${street} ${number}, ${addressObj.suburb || addressObj.city || ''}`

        const ok = await guardarDireccion(
          guardarUbicacion,
          fullAddress,
          selectedLocation.lat,
          selectedLocation.lng
        )
        if (ok) {
          const direccionFiltrada = filtrarCalleAltura(fullAddress)
          onLocationSelect(selectedLocation.lat, selectedLocation.lng, direccionFiltrada)
          setFueraMapa(false)
        } else {
          alert('❌ No se pudo guardar el pin azul en la base')
        }
      } catch (error) {
        console.error('Error al validar dirección:', error)
        alert('⚠️ Error al buscar dirección en Nominatim')
      }
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={`h-6 w-6 p-0 rounded-full border ${
          reverseActive
            ? 'bg-blue-500 text-white border-blue-600'
            : 'bg-red-500 text-white border-red-600'
        }`}
        title={reverseActive ? 'Modo zoom' : 'Modo pin azul'}
      >
        <MapPin className="h-4 w-4" />
      </Button>

      {fueraMapa && <CartelFueraMapa />}
    </>
  )
}
