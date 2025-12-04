'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft } from 'lucide-react'
import { useActualizar } from '@/hooks/useActualizar'
import { buscarCoordenadas, procesarDireccion, useConfirmacion } from '@/components/vista-mapa/LogicaDirecciones'
import { CartelFueraMapa } from '@/components/map-component'

interface BuscarDireccionesProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  onFlyTo: (lat: number, lng: number) => void
  onMinimizar: () => void
}

export function BuscarDirecciones({ onLocationSelect, onFlyTo, onMinimizar }: BuscarDireccionesProps) {
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [fueraMapa, setFueraMapa] = useState(false)

  const { trampas: mosquitoData = [], guardarUbicacion } = useActualizar()
  const { pedirConfirmacion, Modal } = useConfirmacion()

  // ✅ Autocompletado: calles únicas completas ya registradas
  const callesRegistradas = Array.from(
    new Set(
      mosquitoData
        .map((t) => {
          const addr = t.location?.address ?? ''
          // Tomar la parte antes de la coma (ej: "Avenida Fondo de la Legua")
          return addr.split(',')[0].trim().toLowerCase()
        })
        .filter(Boolean)
    )
  )

  // ✅ Filtrar sugerencias según lo que escribe el usuario (por cualquier parte del nombre)
  const sugerencias = street
    ? callesRegistradas.filter((c) =>
        c.includes(street.trim().toLowerCase())
      )
    : callesRegistradas

  const handleSearch = async () => {
    if (!street || !number.trim()) return

    const fullAddress = `${street.trim()} ${number.trim()}`
    setSelectedAddress(fullAddress)

    // ✅ Buscar si ya existe pin con esa calle+altura
    const match = Array.isArray(mosquitoData)
      ? mosquitoData.find(
          (entry) =>
            entry.location?.address?.trim().toLowerCase() === fullAddress.toLowerCase()
        )
      : undefined

    if (match) {
      const { lat, lng } = match.location
      setSelectedLatLng({ lat, lng })
      onLocationSelect(lat, lng, fullAddress)
      onFlyTo(lat, lng)   // 👈 vuelo directo al pin existente
      return
    }

    // ❌ No existe → lógica actual de crear pin
    const coords = await buscarCoordenadas(fullAddress)
    if (!coords) return

    const ok = await procesarDireccion(
      guardarUbicacion,
      coords.lat,
      coords.lng,
      setFueraMapa,
      pedirConfirmacion
    )

    if (ok) {
      setSelectedLatLng(coords)
      setSelectedAddress(fullAddress)
      onLocationSelect(coords.lat, coords.lng, fullAddress)
      onFlyTo(coords.lat, coords.lng)
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

      {/* ✅ Input con autocompletado de calles completas */}
      <Input
        list="callesRegistradas"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        placeholder="Calle"
      />
      <datalist id="callesRegistradas">
        {sugerencias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

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
      {Modal}
    </div>
  )
}
