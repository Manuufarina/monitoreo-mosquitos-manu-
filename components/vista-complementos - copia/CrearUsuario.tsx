'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PlusCircle } from 'lucide-react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function CrearUsuario({
  userRol,
  rolesDisponibles,
}: {
  userRol: string
  rolesDisponibles: string[]
}) {
  const [visible, setVisible] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState('')
  const [nuevoPassword, setNuevoPassword] = useState('')
  const [rolAsignado, setRolAsignado] = useState(rolesDisponibles[0] || '')
  const [mensaje, setMensaje] = useState('')

  const handleCrear = async () => {
    if (!nuevoUsuario.trim() || !nuevoPassword.trim()) {
      setMensaje('⚠️ Completá usuario y contraseña.')
      return
    }

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: nuevoUsuario.trim(),
          password: nuevoPassword.trim(),
          rol: rolAsignado,
        }),
      })

      const result = await res.json()
      if (result.success) {
        setMensaje(`✅ Usuario "${nuevoUsuario}" creado con rol "${rolAsignado}".`)
        setNuevoUsuario('')
        setNuevoPassword('')
        setRolAsignado(rolesDisponibles[0] || '')
      } else {
        setMensaje(`❌ Error: ${result.error || 'No se pudo crear el usuario.'}`)
      }
    } catch (err) {
      console.error('❌ Error en crear usuario:', err)
      setMensaje('❌ Error al conectar con el servidor.')
    }
  }

  return (
    <>
      <div className="flex justify-start">
        <Button onClick={() => setVisible(true)} className="shadow-sm">
          <PlusCircle className="w-4 h-4 mr-2" />
          Añadir usuario
        </Button>
      </div>

      {visible && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <Card className="p-6 space-y-6 w-full max-w-xl bg-white shadow-xl relative">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Crear nuevo usuario</h2>
              <p className="text-sm text-muted-foreground">
                Asigná un rol y credenciales para el nuevo usuario.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nuevo-usuario">Usuario</Label>
              <Input
                id="nuevo-usuario"
                placeholder="Nombre de usuario"
                autoComplete="off"
                value={nuevoUsuario}
                onChange={(e) => setNuevoUsuario(e.target.value)}
              />

              <Label htmlFor="nuevo-password">Contraseña</Label>
              <Input
                id="nuevo-password"
                type="password"
                placeholder="Contraseña"
                autoComplete="new-password"
                value={nuevoPassword}
                onChange={(e) => setNuevoPassword(e.target.value)}
              />

              <Label htmlFor="rol">Rol</Label>
              <Select value={rolAsignado} onValueChange={setRolAsignado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccioná un rol" />
                </SelectTrigger>
                <SelectContent>
                  {rolesDisponibles.map((rol) => (
                    <SelectItem key={rol} value={rol}>
                      {rol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex justify-end pt-2 gap-2">
                <Button onClick={handleCrear}>Crear</Button>
                <Button variant="outline" onClick={() => setVisible(false)}>
                  Cerrar
                </Button>
              </div>

              {mensaje && <p className="text-sm mt-2">{mensaje}</p>}
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
