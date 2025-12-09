'use client'

import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { procesarDireccion, useConfirmacion } from '@/components/vista-mapa/LogicaDirecciones'
import { CartelFueraMapa } from '@/components/map-component'
import { useState } from 'react'

interface BotonReverseProps {
  reverseActive: boolean
  onToggle: (active: boolean) => void
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => Promise<boolean>
  selectedLocation: { address: string; lat: number; lng: number; ubicacion?: string } | null
  onLocationSelect: (lat: number, lng: number, address: string, ubicacion?: string) => void
}

export function BotonReverse({
  reverseActive,
  onToggle,
  guardarUbicacion,
  selectedLocation,
  onLocationSelect,
}: BotonReverseProps) {
  const [fueraMapa, setFueraMapa] = useState(false)
  const { pedirConfirmacion, Modal } = useConfirmacion()

  const handleClick = async () => {
    const nextState = !reverseActive
    onToggle(nextState)

    // 👇 Cuando pasamos de modo zoom a modo pin azul
    if (!nextState && selectedLocation) {
      const ok = await procesarDireccion(
        guardarUbicacion,
        selectedLocation.lat,
        selectedLocation.lng,
        setFueraMapa,
        pedirConfirmacion,
        () => onToggle(true) // 👈 reset automático a azul
      )

      if (ok) {
        onLocationSelect(
          selectedLocation.lat,
          selectedLocation.lng,
          selectedLocation.address,
          selectedLocation.ubicacion ?? null
        )
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
      {Modal}
    </>
  )
}
