import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ✅ GET: obtener todas las trampas con sus coordenadas
export async function GET() {
  try {
    const trampas = await prisma.trampa.findMany({
      select: {
        id: true,
        direccion: true,
        lat: true,
        lng: true,
        ubicacion: true,
      },
      orderBy: { creadoEn: 'asc' },
    })

    return NextResponse.json({ success: true, trampas })
  } catch (err) {
    console.error('❌ Error al leer coordenadas:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

// ✅ PUT: actualizar coordenadas de una trampa existente
export async function PUT(req: Request) {
  try {
    const { id, lat, lng } = await req.json()

    // Validación básica
    if (!id || typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ success: false, error: 'Datos inválidos.' }, { status: 400 })
    }

    // Actualizar coordenadas en la base
    const actualizado = await prisma.trampa.update({
      where: { id }, // id es un ObjectId en Mongo
      data: {
        lat,
        lng,
      },
    })

    return NextResponse.json({ success: true, trampa: actualizado })
  } catch (err) {
    console.error('❌ Error al actualizar coordenadas:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}
