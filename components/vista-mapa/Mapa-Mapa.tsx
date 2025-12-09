'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { BuscarDirecciones } from '@/components/vista-mapa/buscar-direcciones'
import { SidebarInformes } from '@/components/vista-mapa/sidebar-informes'
import { InformesTrampas } from '@/components/vista-mapa/Informes-Trampas'
import { Button } from '@/components/ui/button'
import { shouldHideElemento } from '@/lib/permisos'
import { BotonReverse } from '@/components/vista-mapa/boton-reverse'
import { MapComponent } from '@/components/map-component'
import { procesarDireccion, useConfirmacion } from '@/components/vista-mapa/LogicaDirecciones'

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
    traps: { ovi: boolean; adulto: boolean },
    ubicacion?: string
  ) => Promise<boolean>
  actualizarPosicion: (id: number, nuevaLat: number, nuevaLng: number) => Promise<boolean>
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

  const [selectedLocation, setSelectedLocation] = useState<{ id?: number; address: string; lat: number; lng: number; ubicacion?: string } | null>(null)
  const [selectedTrampa, setSelectedTrampa] = useState<any | null>(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'ovi' | 'adultos' | null>(null)
  const [showFormulario, setShowFormulario] = useState(false)
  const [informeEditando, setInformeEditando] = useState<Informe | null>(null)
  const [menuBusquedaMinimizado, setMenuBusquedaMinimizado] = useState(false)
  const [modoEdicionPin, setModoEdicionPin] = useState(false)
  const [posicionEditada, setPosicionEditada] = useState<{ lat: number; lng: number } | null>(null)

  const [reverseActive, setReverseActive] = useState(true)
  const [flyToRequest, setFlyToRequest] = useState<{ lat: number; lng: number } | null>(null)

  const { pedirConfirmacion, Modal } = useConfirmacion()

  const maximizarMenuBusqueda = () => {
    setMenuBusquedaMinimizado(false)
  }

  // Diferenciamos entre click en trampa existente y click en mapa vacío
  const handleLocationSelect = async (lat: number, lng: number, address: string, id?: number) => {
    if (id) {
      // 👉 click en trampa existente → abrir sidebar
      const trampa = mosquitoData.find((t) => t.id === id)
      if (trampa) {
        setSelectedTrampa(trampa)
        setSelectedLocation({
          id: trampa.id,
          address: trampa.location.address,
          lat: trampa.location.lat,
          lng: trampa.location.lng,
          ubicacion: trampa.ubicacion ?? null,
        })
        setShowFormulario(false)
        setInformeEditando(null)
        setReverseActive(true)
      }
    } else {
      // 👉 click en mapa vacío → procesar nueva dirección
      setSelectedTrampa(null)
      setSelectedLocation(null)

      const ok = await procesarDireccion(
        guardarUbicacion,
        lat,
        lng,
        () => {}, // setFueraMapa si querés manejarlo
        pedirConfirmacion,
        () => setReverseActive(true)
      )

      if (ok) {
        const trampa = {
          id: undefined,
          location: { address, lat, lng },
          ubicacion: null,
          traps: { ovi: false, adulto: false },
        }
        setSelectedTrampa(trampa)
        setSelectedLocation({
          id: trampa.id,
          address: trampa.location.address,
          lat: trampa.location.lat,
          lng: trampa.location.lng,
          ubicacion: trampa.ubicacion ?? null,
        })
        setShowFormulario(false)
        setInformeEditando(null)
        setReverseActive(true)
      }
    }
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
      setReverseActive(true)
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
        <BotonReverse
          reverseActive={reverseActive}
          onToggle={setReverseActive}
          guardarUbicacion={guardarUbicacion}
          selectedLocation={selectedLocation}
          onLocationSelect={(lat, lng, address) => {
            handleLocationSelect(lat, lng, address, undefined)
          }}
          onCerrarSidebar={() => {
            setSelectedTrampa(null)
            setSelectedLocation(null)
          }}
        />
      </div>

{/* Barra de búsqueda de direcciones */}
{!shouldHideElemento(userRol, 'buscar-direcciones') && !menuBusquedaMinimizado && (
  <div className="absolute top-4 right-4 z-[50] w-80 bg-white/95 backdrop-blur-sm border shadow-lg p-4 rounded-lg">
    <BuscarDirecciones
      onLocationSelect={(lat, lng, address) => {
        handleLocationSelect(lat, lng, address, undefined)
      }}
      onFlyTo={(lat, lng) => {
        setFlyToRequest({ lat, lng })
      }}
      onMinimizar={() => setMenuBusquedaMinimizado(true)}
    />
  </div>
)}




      <MapComponent
        selectedLocation={selectedLocation}
        mosquitoData={mosquitoData}
        onLocationSelect={handleLocationSelect}
        reverseActive={reverseActive}
        modoEdicionPin={modoEdicionPin}
        posicionEditada={posicionEditada}
        setPosicionEditada={setPosicionEditada}
        guardarUbicacion={guardarUbicacion}
        flyToRequest={flyToRequest}
        onReverseComplete={() => setReverseActive(true)}
      />

      {Modal}

      {/* SidebarInformes */}
      {selectedTrampa && !showFormulario && !shouldHideElemento(userRol, 'sidebar-informes') && (
        <div className="absolute top-4 right-4 z-[100] w-80">
          <SidebarInformes
            trampaId={selectedTrampa.id}
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
                setReverseActive(true)
              } else {
                alert('❌ No se pudo eliminar el pin.')
              }
            }}
            onGuardarUbicacion={guardarUbicacion}
            onCerrar={() => {
              setSelectedTrampa(null)
              setSelectedLocation(null)
              setReverseActive(true)
            }}
            modoEdicionPin={modoEdicionPin}
            setModoEdicionPin={setModoEdicionPin}
            ubicacion={selectedTrampa.ubicacion}
          />
        </div>
      )}

      {/* Botón para reabrir búsqueda */}
      {!showFormulario && menuBusquedaMinimizado && (
        <div className="absolute top-4 right-4 z-[100] flex flex-col gap-3 items-end">
          {!shouldHideElemento(userRol, 'buscar-direcciones') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={maximizarMenuBusqueda}
              className="relative text-green-900 hover:bg-green-100 border border-green-400 shadow-[0_0_8px_2px_rgba(0,255,0,0.6)] transition-transform duration-300 ease-in-out hover:scale-110"
              title="Direcciones"
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}	
      {/* Formulario de informes */}
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
