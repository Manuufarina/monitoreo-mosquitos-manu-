'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import CrearUsuario from './CrearUsuario'
import ListaUsuarios from './ListaUsuarios'

export default function Usuarios({ userRol }: { userRol: string }) {
  const [rolesDisponibles, setRolesDisponibles] = useState<string[]>([])
  const [mostrarLista, setMostrarLista] = useState(false)

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const res = await fetch('/api/rango')
        const result = await res.json()
        if (result.success && result.rangos) {
          const nombres = result.rangos.map((r: { nombre: string }) => r.nombre)
          setRolesDisponibles(nombres)
        }
      } catch (err) {
        console.error('❌ Error al cargar roles:', err)
      }
    }
    cargarRoles()
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <Card className="p-6 space-y-6 w-full max-w-2xl bg-white shadow-xl relative">
        <h2 className="text-lg font-semibold">Usuarios</h2>
        <div className="flex gap-2">
          <CrearUsuario userRol={userRol} rolesDisponibles={rolesDisponibles} />
          <Button variant="outline" onClick={() => setMostrarLista(!mostrarLista)}>
            Lista
          </Button>
        </div>
        {mostrarLista && <ListaUsuarios />}
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => window.location.reload()}>Cerrar</Button>
        </div>
      </Card>
    </div>
  )
}
