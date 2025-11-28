'use client'

import { useState } from 'react'

interface ReverseGeocodeProps {
  lat: number
  lng: number
  onResult: (direccion: string) => void
}

export function ReverseGeocode({ lat, lng, onResult }: ReverseGeocodeProps) {
  const [loading, setLoading] = useState(false)

  const fetchAddress = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'monitoreo-mosquitosV7/1.0 (tu-email@ejemplo.com)'
          }
        }
      )
      const data = await response.json()
      const direccion = data.display_name || 'Dirección desconocida'
      onResult(direccion)
    } catch (error) {
      console.error('Error en reverse geocoding:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={fetchAddress}
      disabled={loading}
      className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white rounded px-3 py-2"
    >
      {loading ? 'Buscando...' : 'Usar reverse geocoding'}
    </button>
  )
}
