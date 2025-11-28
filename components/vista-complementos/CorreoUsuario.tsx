'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function CorreoUsuario({
  isLoggedIn,
  usuario,
}: {
  isLoggedIn: boolean
  usuario: string
}) {
  const [correo, setCorreo] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [nuevoCorreo, setNuevoCorreo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const yaSolicitadoRef = useRef(false)

  useEffect(() => {
    if (!isLoggedIn || !usuario || usuario.trim().length === 0) return
    if (yaSolicitadoRef.current) {
      console.log('⏸️ Ya se solicitó el correo en esta sesión')
      return
    }

    console.log('📨 Solicitando correo para:', usuario)
    yaSolicitadoRef.current = true

    const clave = `correo-cargado-${usuario.toLowerCase()}`

    const cargarCorreo = async () => {
      try {
        const res = await fetch('/api/leer-correo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario }),
        })

        const result = await res.json()
        if (result.success && result.correo) {
          setCorreo(result.correo)
          sessionStorage.setItem(clave, 'true')
        } else {
          console.warn('⚠️ No se encontró correo para:', usuario)
        }
      } catch (err) {
        console.error('❌ Error al leer correo:', err)
      }
    }

    cargarCorreo()
  }, [isLoggedIn, usuario])

  const handleGuardarCorreo = async () => {
    if (!nuevoCorreo.trim()) {
      setMensaje('⚠️ Ingresá un correo válido.')
      return
    }

    try {
      const res = await fetch('/api/guardar-correo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, correo: nuevoCorreo.trim() }),
      })

      const result = await res.json()
      if (result.success) {
        setCorreo(nuevoCorreo.trim())
        setEditando(false)
        setNuevoCorreo('')
        setMensaje('✅ Correo guardado correctamente.')
        sessionStorage.setItem(`correo-cargado-${usuario.toLowerCase()}`, 'true')
      } else {
        setMensaje(`❌ Error: ${result.error || 'No se pudo guardar el correo.'}`)
      }
    } catch (err) {
      console.error('❌ Error en guardar correo:', err)
      setMensaje('❌ Error al conectar con el servidor.')
    }
  }

  if (!isLoggedIn || !usuario || usuario.trim().length === 0) return null

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-md font-semibold">Correo electrónico</h3>

      {editando ? (
        <div className="space-y-2">
          <Label htmlFor="nuevo-correo">Nuevo correo</Label>
          <Input
            id="nuevo-correo"
            placeholder="ejemplo@correo.com"
            value={nuevoCorreo}
            onChange={(e) => setNuevoCorreo(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleGuardarCorreo}>Guardar</Button>
            <Button variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
          </div>
        </div>
      ) : correo ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{correo}</p>
          <Button variant="ghost" onClick={() => setEditando(true)}>Modificar</Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setEditando(true)}>
          <Mail className="w-4 h-4 mr-2" />
          Añadir correo
        </Button>
      )}

      {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
    </Card>
  )
}
