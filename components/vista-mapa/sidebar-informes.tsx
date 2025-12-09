'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X, Crosshair, Trash2, Edit3, FileText } from 'lucide-react'
import { ConfirmacionModal } from '@/components/ui/ConfirmacionModal'
import { useActualizar } from '@/hooks/useActualizar'

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

interface SidebarInformesProps {
  trampaId: number
  direccion: string
  lat: number
  lng: number
  traps: {
    ovi: boolean
    adulto: boolean
  }
  tipoSeleccionado: 'ovi' | 'adultos' | null
  setTipoSeleccionado: (tipo: 'ovi' | 'adultos' | null) => void
  informes: Informe[]
  onAgregarNuevo: () => void
  onEditarInforme: (informe: Informe) => void
  onEliminarInforme: (id: number) => void
  onEliminarPin: (direccion: string) => Promise<void> | void
  onCerrar: () => void   // 👈 cambiamos la prop: antes era onMinimizar
  modoEdicionPin: boolean
  setModoEdicionPin: (estado: boolean) => void
  ubicacion?: string
  posicionEditada?: { lat: number; lng: number } | null
}

export function SidebarInformes({
  trampaId,
  direccion,
  lat,
  lng,
  traps,
  tipoSeleccionado,
  setTipoSeleccionado,
  informes = [],
  onAgregarNuevo,
  onEditarInforme,
  onEliminarInforme,
  onEliminarPin,
  onCerrar,
  modoEdicionPin,
  setModoEdicionPin,
  ubicacion = '',
  posicionEditada,
}: SidebarInformesProps) {
  const [filtroAnio, setFiltroAnio] = useState<string>('')
  const [filtroMes, setFiltroMes] = useState<string>('')

  const [informePendiente, setInformePendiente] = useState<Informe | null>(null)
  const [confirmarPin, setConfirmarPin] = useState(false)
  const [editandoDireccion, setEditandoDireccion] = useState(false)
  const [direccionEditable, setDireccionEditable] = useState(direccion)

  useEffect(() => {
    setDireccionEditable(direccion)
  }, [direccion])

  const [editandoDescripcion, setEditandoDescripcion] = useState(false)
  const [descripcionEditable, setDescripcionEditable] = useState(ubicacion ?? '')

  useEffect(() => {
    setDescripcionEditable(ubicacion ?? '')
    setEditandoDescripcion(false)
  }, [ubicacion])

  const { actualizarDescripcion, actualizarPosicion } = useActualizar() || {
    actualizarDescripcion: async () => false,
    actualizarPosicion: async () => false,
  }

  const añosDisponibles = Array.from(
    new Set(informes.map((i) => i.fecha.split('T')[0].slice(0, 4)))
  ).sort()

  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ]

  const informesFiltrados = informes.filter((i) => {
    const fechaStr = i.fecha.split('T')[0]
    const [anio, mes] = fechaStr.split('-')
    return (!filtroAnio || anio === filtroAnio) && (!filtroMes || mes === filtroMes)
  })

  const handleEliminarInforme = async () => {
    if (!informePendiente?.id) return
    await onEliminarInforme(informePendiente.id)
    setInformePendiente(null)
  }

  const handleEliminarPin = async () => {
    await onEliminarPin(direccionEditable)
    setConfirmarPin(false)
  }

  const handleConfirmarDireccion = async () => {
    if (editandoDireccion) {
      try {
        const res = await fetch('/api/trampas', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: trampaId,
            nuevaDireccion: direccionEditable,
          }),
        })
        if (res.ok) {
          alert('✅ Dirección actualizada en la base')
        } else {
          alert('❌ No se pudo actualizar la dirección')
        }
      } catch (err) {
        console.error('Error al actualizar dirección:', err)
        alert('❌ Error al conectar con el servidor')
      }
    }
    setEditandoDireccion(!editandoDireccion)
  }

  const handleGuardarDescripcion = async () => {
    const ok = await actualizarDescripcion(trampaId, descripcionEditable)
    if (ok) {
      alert('✅ Descripción actualizada en la base')
      setEditandoDescripcion(false)
    } else {
      alert('❌ No se pudo actualizar la descripción')
    }
  }

  useEffect(() => {
    if (modoEdicionPin && posicionEditada) {
      handleGuardarPosicion(posicionEditada.lat, posicionEditada.lng)
    }
  }, [posicionEditada])

  const handleGuardarPosicion = async (nuevaLat: number, nuevaLng: number) => {
    const ok = await actualizarPosicion(trampaId, nuevaLat, nuevaLng)
    if (ok) {
      alert('✅ Posición actualizada en la base')
      setModoEdicionPin(false)
    } else {
      alert('❌ No se pudo actualizar la posición')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4 relative">
      {/* Botón de cerrar en vez de minimizar */}
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCerrar}
          className="text-red-600 hover:bg-red-100"
          title="Cerrar sidebar informes"
          type="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1 pt-6">
        {/* Dirección */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Dirección</Label>
          {informesFiltrados.length === 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmarPin(true)}
              className="text-red-600 hover:bg-red-100"
              title="Eliminar pin y todos los informes"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {editandoDireccion ? (
          <input
            type="text"
            value={direccionEditable}
            onChange={(e) => setDireccionEditable(e.target.value)}
            className="text-sm border rounded px-2 py-1 w-full"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{direccionEditable?.toUpperCase()}</p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-2 flex items-center gap-2"
          onClick={handleConfirmarDireccion}
        >
          <Edit3 className="w-4 h-4" />
          {editandoDireccion ? 'Confirmar dirección' : 'Modificar dirección'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="mt-2 flex items-center gap-2"
          onClick={() => setEditandoDescripcion(true)}
        >
          <FileText className="w-4 h-4" />
          Descripción
        </Button>

        {editandoDescripcion && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setEditandoDescripcion(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-4 w-[400px] max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-medium mb-2">Descripción de la ubicación</h3>
              <textarea
                value={descripcionEditable}
                onChange={(e) => setDescripcionEditable(e.target.value)}
                placeholder="Escriba la descripción de la ubicación..."
                className="w-full h-24 border rounded p-2 text-sm"
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-green-900 text-white hover:bg-green-800"
                  onClick={handleGuardarDescripcion}
                >
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditandoDescripcion(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Botones de tipo de trampa */}
        <div className="space-y-1">
          <div className="flex space-x-2">
            {traps.ovi && (
              <Button
                variant={tipoSeleccionado === 'ovi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoSeleccionado('ovi')}
                className="bg-green-900 text-white hover:bg-green-800"
              >
                Ovi-Larvi-Trampas
              </Button>
            )}
            {traps.adulto && (
              <Button
                variant={tipoSeleccionado === 'adultos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTipoSeleccionado('adultos')}
                className="bg-green-900 text-white hover:bg-green-800"
              >
                Trampa-Adultos
              </Button>
            )}
          </div>
        </div>

        {/* Lista de informes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Informes</Label>
            <div className="flex gap-2">
              <select
                value={filtroAnio}
                onChange={(e) => setFiltroAnio(e.target.value)}
                className="text-sm border rounded px-1 py-0.5"
              >
                <option value="">Año</option>
                {añosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="text-sm border rounded px-1 py-0.5"
              >
                <option value="">Mes</option>
                {meses.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {informesFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay informes registrados.</p>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
              {informesFiltrados.map((informe) => (
                <div
                  key={informe.id ?? informe.fecha}
                  className="flex items-center justify-between w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-start text-left"
                    onClick={() => onEditarInforme(informe)}
                  >
                    📅 {informe.fecha.split('T')[0]}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setInformePendiente(informe)}
                    className="text-red-600 hover:bg-red-100 ml-2"
                    title="Eliminar informe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 space-y-2">
            <Button
              onClick={onAgregarNuevo}
              className="w-full bg-green-900 text-white hover:bg-green-800"
            >
              Agregar nuevo informe
            </Button>

            <Button
              onClick={() => setModoEdicionPin(!modoEdicionPin)}
              variant="outline"
              className={`w-full flex items-center justify-center gap-2 ${
                modoEdicionPin
                  ? 'border-red-600 text-red-700'
                  : 'border-green-600 text-green-700'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              {modoEdicionPin
                ? 'Modificar posición (activo)'
                : 'Modificar posición del pin'}
            </Button>
          </div>

          {/* Modal para eliminar informe */}
          <ConfirmacionModal
            mensaje={
              informePendiente
                ? `¿Desea eliminar el informe del ${informePendiente.fecha.split('T')[0]}?`
                : ''
            }
            visible={!!informePendiente}
            onConfirm={handleEliminarInforme}
            onCancel={() => setInformePendiente(null)}
          />

          {/* Modal para eliminar pin azul */}
          <ConfirmacionModal
            mensaje={`¿Desea eliminar el pin azul y todos los informes de "${direccionEditable}"?`}
            visible={confirmarPin}
            onConfirm={handleEliminarPin}
            onCancel={() => setConfirmarPin(false)}
          />
        </div>
      </div>
    </div>
  )
}
