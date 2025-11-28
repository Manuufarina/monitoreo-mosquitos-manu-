import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { original, nuevo } = await req.json()

    if (
      !original ||
      !nuevo ||
      typeof original !== 'string' ||
      typeof nuevo !== 'string' ||
      original.trim() === nuevo.trim()
    ) {
      return NextResponse.json({ success: false, error: 'Datos inválidos.' }, { status: 400 })
    }

    const originalNombre = original.trim()
    const nuevoNombre = nuevo.trim()

    // Buscar rango original
    const rango = await prisma.rango.findUnique({
      where: { nombre: originalNombre }
    })

    if (!rango) {
      return NextResponse.json({ success: false, error: 'Rango no encontrado' }, { status: 404 })
    }

    // Renombrar el rango
    const actualizado = await prisma.rango.update({
      where: { id: rango.id },
      data: { nombre: nuevoNombre }
    })

    // Actualizar usuarios que tenían el rango original
    await prisma.usuario.updateMany({
      where: { rangoId: rango.id },
      data: { rangoId: actualizado.id }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en renombrar-rango:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}
