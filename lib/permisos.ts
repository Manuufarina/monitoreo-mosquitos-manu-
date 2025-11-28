// Solo contiene funciones puras que reciben los permisos como parámetro

export function canManageUser(tipoUsuario: string, tipoObjetivo: string, permisos: Record<string, any>): boolean {
  const bloqueos = permisos?.[tipoUsuario]?.bloqueos || []
  return !bloqueos.includes(`users:${tipoObjetivo}`)
}

export function shouldHideElemento(tipoUsuario: string, idElemento: string, permisos: Record<string, any>): boolean {
  const bloqueos = permisos?.[tipoUsuario]?.bloqueos || []
  return bloqueos.includes(`hide:${idElemento}`)
}