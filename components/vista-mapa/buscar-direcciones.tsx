'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ChevronLeft } from 'lucide-react'
import { callesPorDefecto } from '@/data/calles'
import { useActualizar } from '@/hooks/useActualizar'

interface BuscarDireccionesProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  onCreateForm: (location: { address: string; lat: number; lng: number }) => void
  onMinimizar: () => void
}

export function BuscarDirecciones({
  onLocationSelect,
  onCreateForm,
  onMinimizar,
}: BuscarDireccionesProps) {
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [selectedAddress, setSelectedAddress] = useState('')
  const [selectedLatLng, setSelectedLatLng] = useState<{ lat: number; lng: number } | null>(null)
  const [canCreate, setCanCreate] = useState(false)
  const [streetList, setStreetList] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isStreetValid, setIsStreetValid] = useState(false)

  const { trampas: mosquitoData = [], guardarUbicacion } = useActualizar()

  const normalizar = (texto: string) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()

  const cargarCalles = () => {
    const locales = JSON.parse(localStorage.getItem('callesAgregadas') || '[]')
    const todas = [...new Set([...callesPorDefecto, ...locales])]
    setStreetList(todas)
  }

  useEffect(() => {
    cargarCalles()
  }, [])

  useEffect(() => {
    const input = normalizar(street)
    const match = streetList.some((name) => normalizar(name) === input)
    setIsStreetValid(match)

    const filtradas = streetList.filter((name) =>
      normalizar(name).startsWith(input)
    )
    setSuggestions(filtradas.slice(0, 10))
  }, [street, streetList])

  const buscarCoordenadas = async (direccion: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          direccion + ', San Isidro, Buenos Aires, Argentina'
        )}&limit=1`
      )
      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0]
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lon)
        setSelectedLatLng({ lat: latNum, lng: lngNum })
        onLocationSelect(latNum, lngNum, direccion)
        return { lat: latNum, lng: lngNum }
      } else {
        alert('No se encontraron coordenadas.')
        return null
      }
    } catch (error) {
      console.error('Error buscando coordenadas:', error)
      return null
    }
  }

  const handleSearch = async () => {
    if (!street || !number.trim() || !isStreetValid) return

    const fullAddress = `${street} ${number.trim()}`
    setSelectedAddress(fullAddress)

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
      setCanCreate(false)
    } else {
      const coords = await buscarCoordenadas(fullAddress)
      if (coords) {
        // ✅ Persistir la nueva ubicación en la base
        const ok = await guardarUbicacion(fullAddress.trim().toLowerCase(), coords.lat, coords.lng, { ovi: false, adulto: false })
        if (ok) {
          setSelectedLatLng(coords)
          setCanCreate(true)
        }
      }
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <strong className="text-sm font-medium">Buscar dirección</strong>
        <Button
          size="sm"
          variant="ghost"
          onClick={onMinimizar}
          className="h-5 w-5 p-0"
          title="Minimizar menú"
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
      </div>

      <Input
        value={street}
        onChange={(e) => setStreet(normalizar(e.target.value))}
        placeholder="Calle"
        list="street-options"
      />
      <datalist id="street-options">
        {suggestions.map((name) => (
          <option key={name} value={name} />
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
        disabled={!street || !number.trim() || !isStreetValid}
      >
        <Search className="w-4 h-4 mr-2" />
        Buscar dirección
      </Button>

      {selectedAddress && (
        <div className="mt-4">
          <p className="text-sm">Dirección: {selectedAddress}</p>
          {canCreate && selectedLatLng && (
            <Button
              onClick={() =>
                onCreateForm({
                  address: selectedAddress,
                  lat: selectedLatLng.lat,
                  lng: selectedLatLng.lng,
                })
              }
              className="mt-2 w-full"
            >
              Crear informe
            </Button>
          )}
        </div>
      )}
    </>
  )
}
