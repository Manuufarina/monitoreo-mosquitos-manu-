import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 📍 Crear un nuevo rango
export async function PUT(req: Request) {
  try {
    const { nombre, reglas } = await req.json()

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ success: false, error: 'Nombre inválido.' }, { status: 400 })
    }

    // Verificar si ya existe
    const existente = await prisma.rango.findUnique({
      where: { nombre: nombre.trim() }
    })
    if (existente) {
      return NextResponse.json({ success: false, error: 'El rango ya existe.' }, { status: 409 })
    }

    const nuevo = await prisma.rango.create({
      data: {
        nombre: nombre.trim(),
        reglas: reglas || null,
      },
    })

    return NextResponse.json({ success: true, rango: nuevo })
  } catch (err) {
    console.error('❌ Error al crear rango:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

// 📍 Editar (renombrar o actualizar reglas) de un rango
export async function PATCH(req: Request) {
  try {
    const { original, nuevo, reglas } = await req.json()

    if (!original || !nuevo || typeof original !== 'string' || typeof nuevo !== 'string') {
      return NextResponse.json({ success: false, error: 'Datos inválidos.' }, { status: 400 })
    }

    const originalNombre = original.trim()
    const nuevoNombre = nuevo.trim()

    const rango = await prisma.rango.findUnique({
      where: { nombre: originalNombre }
    })

    if (!rango) {
      return NextResponse.json({ success: false, error: 'Rango no encontrado.' }, { status: 404 })
    }

    const actualizado = await prisma.rango.update({
      where: { id: rango.id },
      data: { nombre: nuevoNombre, reglas: reglas || rango.reglas },
    })

    return NextResponse.json({ success: true, rango: actualizado })
  } catch (err) {
    console.error('❌ Error al editar rango:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}

// 📍 Borrar un rango
export async function DELETE(req: Request) {
  try {
    const { nombre } = await req.json()

    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ success: false, error: 'Nombre inválido.' }, { status: 400 })
    }

    const rango = await prisma.rango.findUnique({
      where: { nombre: nombre.trim() }
    })

    if (!rango) {
      return NextResponse.json({ success: false, error: 'Rango no encontrado.' }, { status: 404 })
    }

    await prisma.rango.delete({ where: { id: rango.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error al borrar rango:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 })
  }
}
