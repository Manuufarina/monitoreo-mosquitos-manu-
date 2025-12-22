// lib/trampas.ts

export interface Trampa {
  id: string
  direccion: string
  location?: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
  ubicacion?: string
  traps: {
    ovi: boolean
    adulto: boolean
  }
}

// Helpers centralizados
export function getId(trampa: Trampa): string {
  return trampa.id
}

export function getDireccion(trampa: Trampa): string {
  return trampa.direccion ?? ''
}

export function getLat(trampa: Trampa): number {
  return trampa.location?.coordinates?.[1] ?? 0
}

export function getLng(trampa: Trampa): number {
  return trampa.location?.coordinates?.[0] ?? 0
}

export function getUbicacion(trampa: Trampa): string {
  return trampa.ubicacion ?? 'Sin descripción'
}
