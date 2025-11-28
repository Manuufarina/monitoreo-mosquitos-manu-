import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Normaliza a fecha-día (UTC, sin hora) para que la unique funcione por día
function toDateOnlyUTC(isoOrDate: string | Date) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  // Fuerza a medianoche UTC
  const dateOnly = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  return dateOnly
}

// GET: listar informes (opcionalmente filtrados por trampaId)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const trampaId = searchParams.get('trampaId')

    const informes = await prisma.informe.findMany({
      where: trampaId ? { trampaId: Number(trampaId) } : {},
      orderBy: { fecha: 'desc' },
      include: { trampa: true },
      take: 200,
    })

    return NextResponse.json({ success: true, informes })
  } catch (error) {
    console.error('❌ Error al leer informes:', error)
    return NextResponse.json({ error: 'Error al leer informes' }, { status: 500 })
  }
}

// POST: crear un nuevo informe
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { trampaId, fecha, tipos, cantidades, notas } = body

    if (
      !trampaId ||
      !fecha ||
      !Array.isArray(tipos) ||
      tipos.length === 0 ||
      !cantidades ||
      typeof cantidades !== 'object'
    ) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const cleanBlock = (bloque?: Record<string, unknown>) => {
      const out: Record<string, number> = {}
      if (bloque && typeof bloque === 'object') {
        Object.entries(bloque).forEach(([k, v]) => {
          const n = typeof v === 'number' ? v : Number(v as any)
          if (!Number.isNaN(n) && n > 0) out[k] = n
        })
      }
      return out
    }

    const cleanOvi = cleanBlock(cantidades.ovi)
    const cleanAdultos = cleanBlock(cantidades.adultos)

    if (Object.keys(cleanOvi).length === 0 && Object.keys(cleanAdultos).length === 0) {
      return NextResponse.json({ error: 'No hay cantidades válidas' }, { status: 400 })
    }

    const fechaDia = toDateOnlyUTC(fecha)

    const nuevo = await prisma.informe.create({
      data: {
        trampaId: Number(trampaId),
        fecha: fechaDia, // día UTC
        tipos,
        cantidades: { ovi: cleanOvi, adultos: cleanAdultos },
        notas,
      },
    })

    return NextResponse.json({ success: true, informe: nuevo })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un informe para esa dirección en esa fecha.' },
        { status: 400 }
      )
    }
    console.error('❌ Error al guardar informe:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// PUT: actualizar un informe existente por id
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, trampaId, fecha, tipos, cantidades, notas } = body

    if (!id || !trampaId || !fecha || !Array.isArray(tipos) || tipos.length === 0) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const cleanBlock = (bloque?: Record<string, unknown>) => {
      const out: Record<string, number> = {}
      if (bloque && typeof bloque === 'object') {
        Object.entries(bloque).forEach(([k, v]) => {
          const n = typeof v === 'number' ? v : Number(v as any)
          if (!Number.isNaN(n) && n > 0) out[k] = n
        })
      }
      return out
    }

    const cleanOvi = cleanBlock(cantidades?.ovi)
    const cleanAdultos = cleanBlock(cantidades?.adultos)

    if (Object.keys(cleanOvi).length === 0 && Object.keys(cleanAdultos).length === 0) {
      return NextResponse.json({ error: 'No hay cantidades válidas' }, { status: 400 })
    }

    const fechaDia = toDateOnlyUTC(fecha)

    const actualizado = await prisma.informe.update({
      where: { id: Number(id) },
      data: {
        trampaId: Number(trampaId),
        fecha: fechaDia, // día UTC
        tipos,
        cantidades: { ovi: cleanOvi, adultos: cleanAdultos },
        notas,
      },
    })

    return NextResponse.json({ success: true, informe: actualizado })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe otro informe con esa fecha en esta dirección.' },
        { status: 400 }
      )
    }
    console.error('❌ Error al actualizar informe:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// DELETE: eliminar informe por id único
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Falta id' }, { status: 400 })
    }

    const eliminado = await prisma.informe.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true, informe: eliminado })
  } catch (error) {
    console.error('❌ Error al eliminar informe:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}
