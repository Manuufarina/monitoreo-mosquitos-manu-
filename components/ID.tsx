// C:\Users\Administrador\Documents\monitoreo-mosquitos\components\ID.tsx
'use server'

import { prisma } from '@/lib/prisma'

/**
 * Genera un ID incremental para Zonas (pines azules).
 * Busca el último numeroZona y le suma 1.
 */
export async function generarIdZona(): Promise<number> {
  const ultimaZona = await prisma.trampa.findMany({
    orderBy: { numeroZona: 'desc' },
    take: 1,
  })
  return ultimaZona.length > 0 ? (ultimaZona[0].numeroZona ?? 0) + 1 : 1
}

/**
 * Genera un ID incremental para Informes.
 * Busca el último numeroInforme y le suma 1.
 */
export async function generarIdInforme(): Promise<number> {
  const ultimoInforme = await prisma.informe.findMany({
    orderBy: { numeroInforme: 'desc' },
    take: 1,
  })
  return ultimoInforme.length > 0 ? (ultimoInforme[0].numeroInforme ?? 0) + 1 : 1
}

/**
 * Valida y asigna un ID único para Trampas (manual).
 * Si el número ya existe, devuelve null.
 */
export async function asignarIdTrampa(numeroDeseado: number): Promise<number | null> {
  const existente = await prisma.trampa.findFirst({
    where: { numeroTrampa: numeroDeseado },
  })
  if (existente) {
    return null // ❌ ya existe
  }
  return numeroDeseado // ✅ válido
}
