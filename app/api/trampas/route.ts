import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: listar todas las trampas
export async function GET() {
  try {
    const trampas = await prisma.trampa.findMany({
      include: { informes: true }, // opcional: traer informes asociados
      orderBy: { id: 'asc' }
    })
    return NextResponse.json({ success: true, trampas })
  } catch (error) {
    console.error('❌ Error al leer trampas:', error)
    return NextResponse.json({ error: 'Error al leer trampas' }, { status: 500 })
  }
}

// POST: crear una nueva trampa
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const address = body.location?.address?.trim().toLowerCase()
    const lat = body.location?.lat
    const lng = body.location?.lng

    if (!address || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Faltan datos válidos' }, { status: 400 })
    }

    // Validar duplicado por dirección
    const existente = await prisma.trampa.findFirst({ where: { direccion: address } })
    if (existente) {
      return NextResponse.json({ error: 'Trampa ya existe en esa dirección' }, { status: 409 })
    }

    await prisma.trampa.create({
      data: { direccion: address, lat, lng }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error al crear trampa:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// DELETE: eliminar trampa por dirección
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

// PATCH: actualizar ubicación o dirección de una trampa
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const id = body.id
    const nuevaLat = body.nuevaLat
    const nuevaLng = body.nuevaLng
    const nuevaDireccion = body.nuevaDireccion?.trim().toLowerCase()

    if (!id) {
      return NextResponse.json({ error: 'Falta id de la trampa' }, { status: 400 })
    }

    const data: any = {}
    if (typeof nuevaLat === 'number' && typeof nuevaLng === 'number') {
      data.lat = nuevaLat
      data.lng = nuevaLng
    }
    if (nuevaDireccion) {
      data.direccion = nuevaDireccion
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay datos válidos para actualizar' }, { status: 400 })
    }

    await prisma.trampa.update({
      where: { id: Number(id) },
      data
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error al actualizar trampa:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}
