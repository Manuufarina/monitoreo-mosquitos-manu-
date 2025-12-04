'use client'

import React, { useState } from 'react'
import { esZonaValida } from '@/components/map-component'
import { Button } from '@/components/ui/button'

/* ------------------------------
   Modal de confirmación reutilizable
-------------------------------- */
interface ModalConfirmacionProps {
  mensaje: string
  onAceptar: () => void
  onCancelar: () => void
}

function ModalConfirmacion({ mensaje, onAceptar, onCancelar }: ModalConfirmacionProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full">
        <p className="mb-4 text-sm">{mensaje}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancelar} type="button">
            Cancelar
          </Button>
          <Button onClick={onAceptar} type="button">
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------
   Hook para pedir confirmación
-------------------------------- */
export const useConfirmacion = () => {
  const [opciones, setOpciones] = useState<{ mensaje: string; resolver: (ok: boolean) => void } | null>(null)

  const pedirConfirmacion = (mensaje: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setOpciones({ mensaje, resolver: resolve })
    })
  }

  const Modal = opciones ? (
    <ModalConfirmacion
      mensaje={opciones.mensaje}
      onAceptar={() => {
        opciones.resolver(true)
        setOpciones(null)
      }}
      onCancelar={() => {
        opciones.resolver(false)
        setOpciones(null)
      }}
    />
  ) : null

  return { pedirConfirmacion, Modal }
}

/* ------------------------------
   Helpers de direcciones
-------------------------------- */

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
  setFueraMapa: (val: boolean) => void,
  pedirConfirmacion: (mensaje: string) => Promise<boolean>
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

    // 👇 Usar modal React para confirmar
    const confirmar = await pedirConfirmacion(`¿Desea colocar la trampa en:\n${fullAddress}?`)
    if (!confirmar) {
      return false // usuario canceló
    }

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
