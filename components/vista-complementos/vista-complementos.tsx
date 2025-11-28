'use client'

import CrearUsuario from './CrearUsuario'
import CambiarPassword from './CambiarPassword'
import CorreoUsuario from './CorreoUsuario'
import AgregarCalle from './agregar-calle'
import { getRolesQuePuedeCrear } from '@/lib/utils'
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

  console.log('🧩 Montando VistaComplementos para:', usuario)

  if (!rolFinal) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No se detectó un rol válido. Verificá el login o la configuración de permisos.
      </div>
    )
  }

  const rolesDisponibles = getRolesQuePuedeCrear(rolFinal)

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
