'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function ListaUsuarios() {
  const [rangos, setRangos] = useState<{ id: string; nombre: string }[]>([])
  const [usuariosPorRango, setUsuariosPorRango] = useState<Record<string, any[]>>({})
  const [confirmacion, setConfirmacion] = useState<{ usuario: any; rango: string } | null>(null)
  const [buscadores, setBuscadores] = useState<Record<string, string>>({})

  // 🔹 Cargar rangos al montar
  useEffect(() => {
    const cargarRangos = async () => {
      try {
        const res = await fetch('/api/rango')
        const result = await res.json()
        if (result.success && result.rangos) {
          setRangos(result.rangos)
        }
      } catch (err) {
        console.error('❌ Error al cargar rangos:', err)
      }
    }
    cargarRangos()
  }, [])

  // 🔹 Cargar usuarios por rango
  const cargarUsuariosPorRango = async (rango: string) => {
    try {
      const res = await fetch(`/api/usuarios?rango=${rango}`)
      const result = await res.json()
      if (result.success) {
        setUsuariosPorRango((prev) => ({ ...prev, [rango]: result.usuarios }))
      }
    } catch (err) {
      console.error('❌ Error al cargar usuarios por rango:', err)
    }
  }

  // 🔹 Abrir confirmación de borrado
  const handleEliminarUsuario = (usuario: any, rango: string) => {
    setConfirmacion({ usuario, rango })
  }

  // 🔹 Confirmar acción
  const confirmarAccion = async (accion: 'rango' | 'permanente') => {
    if (!confirmacion) return
    try {
      if (accion === 'rango') {
        await fetch('/api/usuarios', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: confirmacion.usuario.id, quitarRango: true }),
        })
      } else if (accion === 'permanente') {
        await fetch('/api/usuarios', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: confirmacion.usuario.id }),
        })
      }
      setConfirmacion(null)
      await cargarUsuariosPorRango(confirmacion.rango)
    } catch (err) {
      console.error('❌ Error al eliminar usuario:', err)
    }
  }

  // 🔹 Añadir usuario a un rango
  const handleAgregarUsuario = async (rangoNombre: string) => {
    const nombre = prompt(`Ingrese el nombre del usuario para añadir a ${rangoNombre}`)
    if (!nombre) return
    try {
      await fetch('/api/usuarios', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, rangoNombre }), // 👈 ahora mandamos nombre y rangoNombre
      })
      await cargarUsuariosPorRango(rangoNombre)
    } catch (err) {
      console.error('❌ Error al agregar usuario:', err)
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">Lista de usuarios por rango</h3>

      {/* Lista de rangos */}
      <div className="flex gap-2 flex-wrap">
        {rangos.map((r) => (
          <Button
            key={r.id}
            variant="outline"
            onClick={() => cargarUsuariosPorRango(r.nombre)}
          >
            {r.nombre}
          </Button>
        ))}
      </div>

      {/* Usuarios por rango */}
      <div className="mt-4">
        {Object.entries(usuariosPorRango).map(([rango, usuarios]) => {
          const filtro = buscadores[rango] || ''
          const filtrados = usuarios.filter((u) =>
            u.nombre.toLowerCase().includes(filtro.toLowerCase())
          )

          return (
            <div key={rango} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{rango}</h4>
                <Button size="sm" onClick={() => handleAgregarUsuario(rango)}>+</Button>
                <Input
                  placeholder="Buscar usuario..."
                  value={filtro}
                  onChange={(e) =>
                    setBuscadores((prev) => ({ ...prev, [rango]: e.target.value }))
                  }
                  className="w-48"
                />
              </div>
              <ul className="space-y-1">
                {filtrados.map((u) => (
                  <li key={u.id} className="flex justify-between items-center">
                    {u.nombre}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleEliminarUsuario(u, rango)}
                    >
                      X
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Confirmación de borrado */}
      {confirmacion && (
        <Card className="p-4 space-y-4 bg-red-50">
          <p>
            ¿Desea quitar el usuario <strong>{confirmacion.usuario.nombre}</strong> del rango{' '}
            <strong>{confirmacion.rango}</strong> o borrarlo definitivamente?
          </p>
          <div className="flex gap-2">
            <Button onClick={() => confirmarAccion('rango')}>Rango</Button>
            <Button variant="destructive" onClick={() => confirmarAccion('permanente')}>
              Permanente
            </Button>
            <Button variant="outline" onClick={() => setConfirmacion(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}
    </Card>
  )
}
