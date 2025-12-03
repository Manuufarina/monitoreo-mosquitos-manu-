'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft } from 'lucide-react'
import { useActualizar } from '@/hooks/useActualizar'
import { buscarCoordenadas, procesarDireccion } from '@/components/vista-mapa/LogicaDirecciones'
import { CartelFueraMapa } from '@/components/map-component'

interface BuscarDireccionesProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  onFlyTo: (lat: number, lng: number) => void   // 👈 nuevo callback para pedir vuelo directo
  onMinimizar: () => void
}

export function BuscarDirecciones({ onLocationSelect, onFlyTo, onMinimizar }: BuscarDireccionesProps) {
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [fueraMapa, setFueraMapa] = useState(false)

  const { trampas: mosquitoData = [], guardarUbicacion } = useActualizar()

  const handleSearch = async () => {
    if (!street || !number.trim()) return

    const fullAddress = `${street} ${number.trim()}`
    setSelectedAddress(fullAddress)

    // Buscar si ya existe en la base
    const match = Array.isArray(mosquitoData)
      ? mosquitoData.find(
          (entry) =>
            entry.location?.address?.trim().toLowerCase() ===
            fullAddress.trim().toLowerCase()
        )
      : undefined

    if (match) {
      const { lat, lng } = match.location
      setSelectedLatLng({ lat, lng })
      onLocationSelect(lat, lng, fullAddress)
      onFlyTo(lat, lng)   // 👈 pedir vuelo directo al mapa
      return
    }

    const coords = await buscarCoordenadas(fullAddress)
    if (!coords) return

    const ok = await procesarDireccion(guardarUbicacion, coords.lat, coords.lng, setFueraMapa)
    if (ok) {
      setSelectedLatLng(coords)
      setSelectedAddress(fullAddress)
      onLocationSelect(coords.lat, coords.lng, fullAddress)
      onFlyTo(coords.lat, coords.lng)   // 👈 pedir vuelo directo al mapa
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <strong className="text-sm font-medium">Buscar dirección</strong>
        <Button
          size="sm"
          variant="ghost"
          onClick={onMinimizar}
          className="h-5 w-5 p-0"
          title="Minimizar menú"
          type="button"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
      </div>

      <Input
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        placeholder="Calle"
      />

      <Input
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Altura"
        className="mt-2"
      />

      <Button
        onClick={handleSearch}
        className="mt-2 w-full"
        disabled={!street || !number.trim()}
        type="button"
      >
        <Search className="w-4 h-4 mr-2" />
        Buscar dirección
      </Button>

      {selectedAddress && selectedLatLng && (
        <div className="mt-4">
          <p className="text-sm">
            Dirección: {selectedAddress} <br />
            Lat: {selectedLatLng.lat.toFixed(4)}, Lng: {selectedLatLng.lng.toFixed(4)}
          </p>
        </div>
      )}

      {fueraMapa && <CartelFueraMapa />}
    </div>
  )
}
