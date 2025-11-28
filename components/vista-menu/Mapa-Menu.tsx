'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { shouldHideElemento } from '@/lib/permisos'
import { DataSummary } from './data-summary'

// 👇 ahora importamos el nuevo MapComponent fusionado
const MapComponent = dynamic(() => import('@/components/map-component').then(mod => mod.MapComponent), {
  ssr: false,
})

interface Informe {
  direccion: string
  fecha: string
  lat: number
  lng: number
  cantidades?: {
    ovi?: { Aedes?: string; Culex?: string; Anopheles?: string }
    adultos?: { Aedes?: string; Culex?: string; Anopheles?: string }
  }
}

interface MapaMenuProps {
  trampas: any[]
  informesPorDireccion: Record<string, Informe[]>
  especiesPorDireccion: Record<string, { Aedes: number; Culex: number; Anopheles: number }>
  userRol: string
  resumen: {
    totalRecords: number
    uniqueLocations: number
    culexCount: number
    aedesCount: number
    anophelesCount: number
    topSpecies: string
    hasData: boolean
  }
}

export function MapaMenu({
  trampas,
  informesPorDireccion,
  especiesPorDireccion,
  userRol,
  resumen,
}: MapaMenuProps) {
  const rol = userRol?.trim().toLowerCase()
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    lat: number
    lng: number
  } | null>(null)

  const [selectedTrampa, setSelectedTrampa] = useState<any | null>(null)

  const mosquitoData = trampas

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    const match = mosquitoData.find((t) => t.location.address === address)
    if (match) setSelectedTrampa(match)
    setSelectedLocation({ address, lat, lng })
  }

  return (
    <div className="relative h-[calc(100vh-120px)] overflow-visible z-0">
      <MapComponent
        selectedLocation={selectedLocation}
        mosquitoData={mosquitoData}
        onLocationSelect={handleLocationSelect}
        reverseActive={true} // 👈 en menú lo dejamos fijo en modo zoom
      />

      <div className="absolute top-4 right-4 z-[100] w-[300px]">
        <DataSummary {...resumen} />
      </div>
    </div>
  )
}
