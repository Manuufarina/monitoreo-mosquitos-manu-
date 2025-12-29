'use client'

import { useState, useEffect } from 'react'
import CrearUsuario from './CrearUsuario'
import CambiarPassword from './CambiarPassword'
import CorreoUsuario from './CorreoUsuario'
import AgregarCalle from './agregar-calle'
import { shouldHideElemento } from '@/lib/permisos'

export default function VistaComplementos({
  userRol,
  isLoggedIn,
  usuario,
}: {
  userRol: string
  isLoggedIn: boolean
  usuario: string
}) {
  const rolFinal = userRol?.trim().toLowerCase()
  const [rolesDisponibles, setRolesDisponibles] = useState<string[]>([])

  console.log('🧩 Montando VistaComplementos para:', usuario)

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
        console.error('❌ Error al cargar roles desde /api/rango:', err)
      }
    }
    cargarRoles()
  }, [])

  if (!rolFinal) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No se detectó un rol válido. Verificá el login o la configuración de permisos.
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <p className="text-sm text-muted-foreground">
        Rol actual: <strong>{rolFinal}</strong>
      </p>

      <div className="flex flex-wrap gap-4 items-start">
        {!shouldHideElemento(rolFinal, 'agregar-calle') && (
          <AgregarCalle userRol={rolFinal} />
        )}

        {!shouldHideElemento(rolFinal, 'crear-usuario') && (
          <CrearUsuario userRol={rolFinal} rolesDisponibles={rolesDisponibles} />
        )}
      </div>

      <CambiarPassword />
      <CorreoUsuario isLoggedIn={isLoggedIn} usuario={usuario} />
    </div>
  )
}
