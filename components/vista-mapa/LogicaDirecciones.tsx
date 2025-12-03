'use client'

import React from 'react'
import { esZonaValida } from '@/components/map-component'

// Filtrar solo calle + altura
export const filtrarCalleAltura = (direccion: string) => {
  return direccion.split(',')[0].trim()
}

// Buscar coordenadas en Nominatim
export const buscarCoordenadas = async (direccion: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        direccion + ', San Isidro, Buenos Aires, Argentina'
      )}&limit=1`
    )
    const data = await response.json()

    if (Array.isArray(data) && data.length > 0) {
      const { lat, lon } = data[0]
      return { lat: parseFloat(lat), lng: parseFloat(lon) }
    }
    return null
  } catch (error) {
    console.error('Error buscando coordenadas:', error)
    return null
  }
}

// Guardar ubicación en la base (wrapper)
export const guardarDireccion = async (
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => Promise<boolean>,
  direccion: string,
  lat: number,
  lng: number
) => {
  const direccionFiltrada = filtrarCalleAltura(direccion).toLowerCase()
  // 👇 ahora pasamos ubicacion vacío por defecto
  return await guardarUbicacion(direccionFiltrada, lat, lng, { ovi: false, adulto: false }, "")
}

// 🚨 Helper unificado: reverse geocode + validación + guardado
export const procesarDireccion = async (
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => Promise<boolean>,
  lat: number,
  lng: number,
  setFueraMapa: (val: boolean) => void
) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'es' } }
    )
    const data = await response.json()
    const addressObj = data.address

    if (!addressObj || !esZonaValida(addressObj)) {
      setFueraMapa(true)
      return false
    }

    const street =
      addressObj.road ||
      addressObj.pedestrian ||
      addressObj.street ||
      'Calle desconocida'
    const number = addressObj.house_number || 'S/N'
    const fullAddress = `${street} ${number}, ${addressObj.suburb || addressObj.city || ''}`

    // 👇 ahora pasa ubicacion vacío
    const ok = await guardarDireccion(guardarUbicacion, fullAddress, lat, lng)
    if (ok) {
      setFueraMapa(false)
      return true
    }
    return false
  } catch (error) {
    console.error('Error al procesar dirección:', error)
    return false
  }
}
