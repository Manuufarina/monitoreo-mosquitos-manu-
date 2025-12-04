'use client'

import { createContext, useEffect, useState } from 'react'

interface Informe {
  id?: number
  trampaId: number
  fecha: string
  tipos: ('ovi' | 'adultos')[]
  cantidades?: {
    ovi?: { Anopheles?: number; Aedes?: number; Culex?: number }
    adultos?: { Anopheles?: number; Aedes?: number; Culex?: number }
  }
  notas?: string
}

interface ActualizarContextType {
  trampas: any[]
  informes: Informe[]
  recargarTrampas: () => Promise<void>
  recargarInformes: () => Promise<void>
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => Promise<boolean>
  crearInforme: (nuevo: Informe, informeAnterior?: Informe) => Promise<boolean>
  eliminarInforme: (id: number) => Promise<boolean>
  eliminarPin: (direccion: string) => Promise<boolean>
  actualizarPosicion: (trampaId: number, nuevaLat: number, nuevaLng: number) => Promise<boolean>
  actualizarDescripcion: (trampaId: number, nuevaUbicacion: string) => Promise<boolean>
  selectedTrampa: any | null
  setSelectedTrampa: (trampa: any | null) => void
}

export const ActualizarContext = createContext<ActualizarContextType | undefined>(undefined)

export function ActualizarProvider({ children }: { children: React.ReactNode }) {
  const [trampas, setTrampas] = useState<any[]>([])
  const [informes, setInformes] = useState<Informe[]>([])
  const [selectedTrampa, setSelectedTrampa] = useState<any | null>(null)

  const recargarTrampas = async () => {
    try {
      const res = await fetch('/api/trampas', { cache: 'no-store' })
      const data = await res.json()
      const trampasRaw = Array.isArray(data.trampas) ? data.trampas : Array.isArray(data) ? data : []

      setTrampas(
        trampasRaw.map((t: any) => ({
          id: t.id,
          location: {
            address: t.direccion,
            lat: Number(t.lat),
            lng: Number(t.lng),
          },
          ubicacion: t.ubicacion ?? "",
          traps: { ovi: t.ovi ?? false, adulto: t.adulto ?? false },
        }))
      )
    } catch (err) {
      console.error('❌ Error al recargar trampas:', err)
      setTrampas([])
    }
  }

  const recargarInformes = async () => {
    try {
      const res = await fetch('/api/informes', { cache: 'no-store' })
      const data = await res.json()
      const informesRaw = Array.isArray(data.informes) ? data.informes : Array.isArray(data) ? data : []
      setInformes(informesRaw)
    } catch (err) {
      console.error('❌ Error al recargar informes:', err)
      setInformes([])
    }
  }

  useEffect(() => {
    recargarTrampas()
    recargarInformes()
  }, [])

  const guardarUbicacion = async (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/trampas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direccion, lat, lng, traps, ubicacion }),
      })
      const result = await res.json()
      if (result.success) {
        await recargarTrampas()
        return true
      }
    } catch (err) {
      console.error('❌ Error al guardar ubicación:', err)
    }
    return false
  }

  const crearInforme = async (nuevo: Informe, informeAnterior?: Informe): Promise<boolean> => {
    try {
      const method = nuevo.id || informeAnterior?.id ? 'PUT' : 'POST'
      const res = await fetch('/api/informes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      })
      const result = await res.json()
      if (result.success) {
        await recargarInformes()
        return true
      } else {
        console.error('❌ Error al guardar/actualizar informe:', result.error)
      }
    } catch (err) {
      console.error('❌ Error en crearInforme:', err)
    }
    return false
  }

  const eliminarInforme = async (id: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/informes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        await recargarInformes()
        return true
      } else {
        const error = await res.json()
        console.error('❌ Error al eliminar informe:', error.error)
      }
    } catch (err) {
      console.error('❌ Error en DELETE informe:', err)
    }
    return false
  }

  const eliminarPin = async (direccion: string): Promise<boolean> => {
    try {
      const resTrampas = await fetch('/api/trampas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direccion }),
      })
      const resInformes = await fetch('/api/informes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direccion }),
      })
      if (resTrampas.ok || resInformes.ok) {
        await recargarTrampas()
        await recargarInformes()
        return true
      }
    } catch (err) {
      console.error('❌ Error al eliminar pin:', err)
    }
    return false
  }

  const actualizarPosicion = async (
    trampaId: number,
    nuevaLat: number,
    nuevaLng: number
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/trampas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trampaId, nuevaLat, nuevaLng }), // 👈 usar id
      })
      const result = await res.json()
      if (result.success) {
        setTrampas((prev) =>
          prev.map((t) =>
            t.id === trampaId
              ? { ...t, location: { ...t.location, lat: nuevaLat, lng: nuevaLng } }
              : t
          )
        )
        return true
      }
    } catch (err) {
      console.error('❌ Error al actualizar posición:', err)
    }
    return false
  }

  const actualizarDescripcion = async (
    trampaId: number,
    nuevaUbicacion: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/trampas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trampaId, nuevaUbicacion }), // 👈 usar id
      })
      const result = await res.json()
      if (result.success) {
        setTrampas((prev) =>
          prev.map((t) =>
            t.id === trampaId ? { ...t, ubicacion: nuevaUbicacion } : t
          )
        )
        return true
      }
    } catch (err) {
      console.error('❌ Error al actualizar descripción:', err)
    }
    return false
  }

  return (
    <ActualizarContext.Provider
      value={{
        trampas,
        informes,
        recargarTrampas,
        recargarInformes,
        guardarUbicacion,
        crearInforme,
        eliminarInforme,
        eliminarPin,
        actualizarPosicion,
        actualizarDescripcion,
        selectedTrampa,
        setSelectedTrampa,
      }}
    >
      {children}
    </ActualizarContext.Provider>
  )
}
