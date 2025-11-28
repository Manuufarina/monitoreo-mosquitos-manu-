'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2 } from 'lucide-react'
import { callesPorDefecto } from '@/data/calles'
import { ConfirmacionModal } from '@/components/ui/ConfirmacionModal'

export default function AgregarCalle({ userRol }: { userRol: string }) {
  const rol = userRol?.trim().toLowerCase()
 

  const [visible, setVisible] = useState(false)
  const [nuevaCalle, setNuevaCalle] = useState('')
  const [callesLocales, setCallesLocales] = useState<string[]>([])
  const [mensaje, setMensaje] = useState('')
  const [callePendiente, setCallePendiente] = useState<string | null>(null)

  const normalizar = (texto: string) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim()

  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem('callesAgregadas') || '[]')
    setCallesLocales(guardadas)
  }, [])

  const handleAgregar = () => {
    const nombre = normalizar(nuevaCalle)
    if (!nombre) {
      setMensaje('⚠️ Ingresá un nombre válido.')
      return
    }

    const yaExiste =
      callesPorDefecto.includes(nombre) || callesLocales.includes(nombre)

    if (yaExiste) {
      setMensaje(`❌ La calle "${nombre}" ya existe.`)
      return
    }

    const actualizadas = [...callesLocales, nombre]
    localStorage.setItem('callesAgregadas', JSON.stringify(actualizadas))
    setCallesLocales(actualizadas)
    setNuevaCalle('')
    setMensaje(`✅ Calle "${nombre}" agregada correctamente.`)
  }

  const confirmarEliminar = (nombre: string) => {
    setCallePendiente(nombre)
  }

  const cancelarEliminar = () => {
    setCallePendiente(null)
  }

  const eliminarCalle = () => {
    if (!callePendiente) return
    const actualizadas = callesLocales.filter((c) => c !== callePendiente)
    localStorage.setItem('callesAgregadas', JSON.stringify(actualizadas))
    setCallesLocales(actualizadas)
    setMensaje(`🗑️ Calle "${callePendiente}" eliminada.`)
    setCallePendiente(null)
  }

  return (
    <>
      {/* ✅ Botón integrado al layout */}
      <div className="flex justify-start">
        <Button onClick={() => setVisible(true)} className="shadow-sm">
          <PlusCircle className="w-4 h-4 mr-2" />
          Añadir calle
        </Button>
      </div>

      {/* ✅ Panel modal */}
      {visible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <Card className="p-6 space-y-6 w-full max-w-xl bg-white shadow-xl relative">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Agregar calle personalizada</h2>
              <p className="text-sm text-muted-foreground">
                Las calles agregadas aquí no modifican las oficiales por defecto.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nueva-calle">Nombre de la calle</Label>
              <div className="flex gap-2">
                <Input
                  id="nueva-calle"
                  placeholder="Escriba la calle aquí"
                  autoComplete="off"
                  value={nuevaCalle}
                  onChange={(e) => setNuevaCalle(normalizar(e.target.value))}
                />
                <Button onClick={handleAgregar} disabled={!nuevaCalle.trim()}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Añadir
                </Button>
              </div>
              {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
            </div>

            {callesLocales.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Calles agregadas</Label>
                <ul className="pl-1 text-sm text-muted-foreground space-y-1">
                  {callesLocales.map((c, i) => (
                    <li key={i} className="flex items-center justify-between pr-2">
                      <span className="pl-4 list-disc">{c}</span>
                      <button
                        onClick={() => confirmarEliminar(c)}
                        title={`Eliminar ${c}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setVisible(false)}>
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmacionModal
        mensaje={`¿Desea eliminar la calle "${callePendiente}"?`}
        visible={!!callePendiente}
        onConfirm={eliminarCalle}
        onCancel={cancelarEliminar}
      />
    </>
  )
}
