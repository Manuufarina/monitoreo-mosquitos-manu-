import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ GET: listar todas las trampas con sus informes
export async function GET() {
  try {
    const trampas = await prisma.trampa.findMany({
      include: { informes: true },
      orderBy: { creadoEn: 'asc' },
    })

    const trampasSerializadas = trampas.map((t) => ({
      ...t,
      creadoEn: t.creadoEn.toISOString(),
      numeroZona: t.numeroZona,
      numeroTrampa: t.numeroTrampa,
    }))

    return NextResponse.json({ success: true, trampas: trampasSerializadas })
  } catch (error) {
    console.error('❌ Error al leer trampas:', error)
    return NextResponse.json({ error: 'Error al leer trampas' }, { status: 500 })
  }
}

// ✅ POST: crear una nueva trampa con númeroZona incremental y númeroTrampa manual o autogenerado
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const address = body.direccion?.trim().toLowerCase()
    const lat = Number(body.lat)
    const lng = Number(body.lng)
    const ubicacion = body.ubicacion?.trim() || null
    let numeroTrampa = body.numeroTrampa ? Number(body.numeroTrampa) : null

    if (!address || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Faltan datos válidos' }, { status: 400 })
    }

    // 🔧 Si no viene numeroTrampa, lo generamos incremental
    if (!numeroTrampa) {
      const ultimaTrampa = await prisma.trampa.findMany({
        orderBy: { numeroTrampa: 'desc' },
        take: 1,
      })
      numeroTrampa = ultimaTrampa.length > 0 ? (ultimaTrampa[0].numeroTrampa ?? 0) + 1 : 1
    }

    // Validar que no exista otra trampa con el mismo numeroTrampa
    const existenteTrampa = await prisma.trampa.findFirst({ where: { numeroTrampa } })
    if (existenteTrampa) {
      return NextResponse.json({ error: 'Ese número de trampa ya existe' }, { status: 409 })
    }

    // 🔧 Buscar último númeroZona asignado
    const ultimaZona = await prisma.trampa.findMany({
      orderBy: { numeroZona: 'desc' },
      take: 1,
    })
    const nuevoNumeroZona = ultimaZona.length > 0 ? (ultimaZona[0].numeroZona ?? 0) + 1 : 1

    const nuevaTrampa = await prisma.trampa.create({
      data: {
        direccion: address,
        lat,
        lng,
        ubicacion,
        numeroZona: nuevoNumeroZona,
        numeroTrampa,
      },
    })

    return NextResponse.json({
      success: true,
      trampa: {
        ...nuevaTrampa,
        creadoEn: nuevaTrampa.creadoEn.toISOString(),
      },
    })
  } catch (error) {
    console.error('❌ Error al crear trampa:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// ✅ DELETE: eliminar trampa por dirección
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const direccion = body.direccion?.trim().toLowerCase()

    if (!direccion) {
      return NextResponse.json({ error: 'Falta dirección' }, { status: 400 })
    }

    const eliminado = await prisma.trampa.deleteMany({ where: { direccion } })
    return NextResponse.json({ success: true, eliminados: eliminado.count })
  } catch (error) {
    console.error('❌ Error al eliminar trampa:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// ✅ PATCH: actualizar dirección, ubicación o coordenadas de una trampa
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const id = body.id as string
    const nuevaDireccion = body.nuevaDireccion?.trim()?.toLowerCase()
    const nuevaUbicacion = body.nuevaUbicacion?.trim()
    const nuevaLat = body.nuevaLat
    const nuevaLng = body.nuevaLng

    if (!id) {
      return NextResponse.json({ error: 'Falta id de la trampa' }, { status: 400 })
    }

    const data: Record<string, any> = {}

    if (typeof nuevaLat === 'number' && typeof nuevaLng === 'number') {
      data.lat = nuevaLat
      data.lng = nuevaLng
    }
    if (nuevaDireccion) {
      data.direccion = nuevaDireccion
    }
    if (nuevaUbicacion) {
      data.ubicacion = nuevaUbicacion
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay datos válidos para actualizar' }, { status: 400 })
    }

    await prisma.trampa.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error al actualizar trampa:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}
