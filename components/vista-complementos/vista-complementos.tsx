'use client'

import { useState } from 'react'
import CambiarPassword from './CambiarPassword'
import CorreoUsuario from './CorreoUsuario'
import Usuarios from './Usuarios'
import Rangos from './Rangos'
import { Button } from '@/components/ui/button'

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
  const [menuActivo, setMenuActivo] = useState<'usuarios' | 'rangos' | null>(null)

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

      {/* Botones principales */}
      <div className="flex gap-4">
        <Button onClick={() => setMenuActivo('usuarios')}>Usuarios</Button>
        <Button onClick={() => setMenuActivo('rangos')}>Rangos</Button>
      </div>

      {/* Menús flotantes */}
      {menuActivo === 'usuarios' && (
        <Usuarios userRol={rolFinal} onClose={() => setMenuActivo(null)} />
      )}
      {menuActivo === 'rangos' && (
        <Rangos onClose={() => setMenuActivo(null)} />
      )}

      <CambiarPassword usuario={usuario} />
      <CorreoUsuario isLoggedIn={isLoggedIn} usuario={usuario} />
    </div>
  )
}
