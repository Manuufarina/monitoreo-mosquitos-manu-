'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Lock } from 'lucide-react'

export default function CambiarPassword() {
  const [editando, setEditando] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [passwordActual, setPasswordActual] = useState('')
  const [passwordNueva, setPasswordNueva] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleCambiarPassword = async () => {
    if (!usuario || !passwordActual || !passwordNueva) {
      setMensaje('⚠️ Completá todos los campos.')
      return
    }

    try {
      const res = await fetch('/api/cambiar-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario,
          passwordActual,
          passwordNueva,
        }),
      })

      const result = await res.json()
      if (result.success) {
        setMensaje('✅ Contraseña actualizada correctamente.')
        setEditando(false)
        setUsuario('')
        setPasswordActual('')
        setPasswordNueva('')
      } else {
        setMensaje(`❌ Error: ${result.error || 'No se pudo cambiar la contraseña.'}`)
      }
    } catch (err) {
      console.error('❌ Error en fetch:', err)
      setMensaje('❌ Error al conectar con el servidor.')
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-md font-semibold">Cambiar contraseña</h3>

      {editando ? (
        <div className="space-y-2">
          <Label>Usuario</Label>
          <Input
            placeholder="Nombre de usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <Label>Contraseña actual</Label>
          <Input
            type="password"
            placeholder="Contraseña actual"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
          />

          <Label>Nueva contraseña</Label>
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
          />

          {mensaje && <p className="text-sm mt-2">{mensaje}</p>}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleCambiarPassword}>Guardar</Button>
            <Button variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setEditando(true)}>
          <Lock className="w-4 h-4 mr-2" />
          Cambiar contraseña
        </Button>
      )}
    </Card>
  )
}
