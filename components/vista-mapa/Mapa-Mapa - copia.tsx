'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronRight } from 'lucide-react'
import { BuscarDirecciones } from '@/components/vista-mapa/buscar-direcciones'
import { SidebarInformes } from '@/components/vista-mapa/sidebar-informes'
import { InformesTrampas } from '@/components/vista-mapa/Informes-Trampas'
import { Button } from '@/components/ui/button'
import { shouldHideElemento } from '@/lib/permisos'
import { BotonReverse } from '@/components/vista-mapa/boton-reverse'

const MapComponent = dynamic(() => import('@/components/map-component.tsx').then(mod => mod.MapComponent), {
  ssr: false,
})

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

interface MapaMapaProps {
  trampas: any[]
  informesPorTrampa: Record<number, Informe[]>
  especiesPorTrampa: Record<number, { Aedes: number; Culex: number; Anopheles: number }>
  userRol: string
  recargarTrampas: () => Promise<void>
  recargarInformes: () => Promise<void>
  crearInforme: (nuevo: Partial<Informe>, informeAnterior?: Informe | null) => Promise<boolean>
  eliminarInforme: (id: number) => Promise<boolean>
  eliminarPin: (direccion: string) => Promise<boolean>
  guardarUbicacion: (
    direccion: string,
    lat: number,
    lng: number,
    traps: { ovi: boolean; adulto: boolean }
  ) => Promise<boolean>
  actualizarPosicion: (direccion: string, nuevaLat: number, nuevaLng: number) => Promise<boolean>
}

export function MapaMapa({
  trampas,
  informesPorTrampa,
  especiesPorTrampa,
  userRol,
  recargarTrampas,
  recargarInformes,
  crearInforme,
  eliminarInforme,
  eliminarPin,
  guardarUbicacion,
  actualizarPosicion,
}: MapaMapaProps) {
  if (shouldHideElemento(userRol, 'mapa-mapa')) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No tenés acceso al mapa.
      </div>
    )
  }

  const mosquitoData = trampas

  const [selectedLocation, setSelectedLocation] = useState<{ address: string; lat: number; lng: number } | null>(null)
  const [selectedTrampa, setSelectedTrampa] = useState<any | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'ovi' | 'adultos' | null>(null)
  const [showFormulario, setShowFormulario] = useState(false)
  const [informeEditando, setInformeEditando] = useState<Informe | null>(null)
  const [menuBusquedaMinimizado, setMenuBusquedaMinimizado] = useState(false)
  const [sidebarMinimizado, setSidebarMinimizado] = useState(true)
  const [modoEdicionPin, setModoEdicionPin] = useState(false)
  const [posicionEditada, setPosicionEditada] = useState<{ lat: number; lng: number } | null>(null)

  const [reverseActive, setReverseActive] = useState(true)

  useEffect(() => {
    if (!modoEdicionPin && posicionEditada && selectedTrampa?.location?.address) {
      const guardarNuevaPosicion = async () => {
        const ok = await actualizarPosicion(
          selectedTrampa.location.address,
          posicionEditada.lat,
          posicionEditada.lng
        )
        if (ok) {
          setSelectedTrampa((prev: any) => ({
            ...prev,
            location: {
              ...prev.location,
              lat: posicionEditada.lat,
              lng: posicionEditada.lng,
            },
          }))
          setPosicionEditada(null)
          await recargarTrampas()
        } else {
          alert('❌ No se pudo guardar la nueva posición.')
        }
      }
      guardarNuevaPosicion()
    }
  }, [modoEdicionPin])

  const maximizarMenuBusqueda = () => {
    setMenuBusquedaMinimizado(false)
    setSidebarMinimizado(true)
  }

  const maximizarSidebar = () => {
    setSidebarMinimizado(false)
    setMenuBusquedaMinimizado(true)
  }

  // ✅ ahora recibe también id
  const handleLocationSelect = (lat: number, lng: number, address: string, id?: number) => {
    const match = Array.isArray(mosquitoData)
      ? mosquitoData.find((t) => t.id === id)
      : undefined

    const fallbackTrampa = {
      id: id ?? 0,
      location: { address, lat, lng },
      traps: { ovi: false, adulto: false },
    }

    setSelectedTrampa(match || fallbackTrampa)
    setSelectedLocation({ address, lat, lng })
    setShowFormulario(false)
    setInformeEditando(null)
    maximizarSidebar()
  }

  const handleGuardarInforme = async (nuevo: Partial<Informe>) => {
    const trampaId = selectedTrampa?.id ?? 0
    if (!trampaId) {
      alert('❌ No se pudo determinar la trampa para guardar el informe.')
      return
    }
    const payload = { ...nuevo, trampaId }
    const ok = await crearInforme(payload, informeEditando ?? undefined)
    if (ok) {
      setShowFormulario(false)
      setInformeEditando(null)
      await recargarInformes()
    }
  }

  const handleEliminarInforme = async (id: number) => {
    const ok = await eliminarInforme(id)
    if (ok) {
      await recargarInformes()
    }
  }

  return (
    <div className="relative h-[calc(100vh-120px)] overflow-visible z-0">
      <div className="absolute top-4 left-4 z-[1000]">
        <BotonReverse reverseActive={reverseActive} onToggle={setReverseActive} />
      </div>

      <MapComponent
        selectedLocation={selectedLocation}
        mosquitoData={mosquitoData}
        onLocationSelect={handleLocationSelect}
        reverseActive={reverseActive}
      />

      {!menuBusquedaMinimizado && !shouldHideElemento(userRol, 'buscar-direcciones') && (
        <div className="absolute top-4 right-4 z-[100] w-80 bg-white/95 backdrop-blur-sm border shadow-lg p-4 rounded-lg">
          <BuscarDirecciones
            onLocationSelect={(loc) => handleLocationSelect(loc.lat, loc.lng, loc.address, 0)} // nuevas direcciones
            onCreateForm={(location) => {
              setSelectedLocation(location)
              setInformeEditando(null)
              setShowFormulario(true)
            }}
            onMinimizar={() => setMenuBusquedaMinimizado(true)}
          />
        </div>
      )}

      {selectedTrampa && !showFormulario && !sidebarMinimizado && !shouldHideElemento(userRol, 'sidebar-informes') && (
        <div className="absolute top-4 right-4 z-[100] w-80">
          <SidebarInformes
            direccion={selectedTrampa.location.address}
            lat={selectedTrampa.location.lat}
            lng={selectedTrampa.location.lng}
            traps={selectedTrampa.traps}
            tipoSeleccionado={tipoSeleccionado}
            setTipoSeleccionado={setTipoSeleccionado}
            informes={informesPorTrampa[selectedTrampa.id] || []}
            onAgregarNuevo={() => {
              setInformeEditando(null)
              setShowFormulario(true)
            }}
            onEditarInforme={(informe) => {
              setInformeEditando(informe)
              setShowFormulario(true)
            }}
            onEliminarInforme={handleEliminarInforme}
            onEliminarPin={async (direccion) => {
              const ok = await eliminarPin(direccion)
              if (ok) {
                await recargarTrampas()
                setSelectedTrampa(null)
                setSelectedLocation(null)
              } else {
                alert('❌ No se pudo eliminar el pin.')
              }
            }}
            onGuardarUbicacion={guardarUbicacion}
            onMinimizar={() => setSidebarMinimizado(true)}
            modoEdicionPin={modoEdicionPin}
            setModoEdicionPin={setModoEdicionPin}
          />
        </div>
      )}

      {!showFormulario && menuBusquedaMinimizado && sidebarMinimizado && (
        <div className="absolute top-4 right-4 z-[100] flex flex-col gap-3 items-end">
          {!shouldHideElemento(userRol, 'buscar-direcciones') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={maximizarMenuBusqueda}
              className="relative text-green-900 hover:bg-green-100 border border-green-400 shadow-[0_0_8px_2px_rgba(0,255,0,0.6)] transition-transform duration-300 ease-in-out hover:scale-110"
              title="Direcciones"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
          {!shouldHideElemento(userRol, 'sidebar-informes') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={maximizarSidebar}
              className="relative text-green-900 hover:bg-green-100 border border-green-400 shadow-[0_0_8px_2px_rgba(0,255,0,0.6)] transition-transform duration-300 ease-in-out hover:scale-110"
              title="Informes"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {selectedTrampa && showFormulario && !shouldHideElemento(userRol, 'Informes-Trampas') && (
        <div className="absolute inset-0 z-[100] bg-black/50 flex items-center justify-center">
          <div className="w-[88vw] max-w-3xl max-h-[90vh] overflow-auto p-6 bg-white rounded-lg shadow-xl">
            <InformesTrampas
              direccion={selectedTrampa.location.address}
              lat={selectedTrampa.location.lat}
              lng={selectedTrampa.location.lng}
              trampaId={selectedTrampa.id ?? 0}
              informesExistentes={informesPorTrampa[selectedTrampa.id] || []}
              informeExistente={informeEditando}
              onGuardado={handleGuardarInforme}
              onCancelar={() => {
                setShowFormulario(false)
                setInformeEditando(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
