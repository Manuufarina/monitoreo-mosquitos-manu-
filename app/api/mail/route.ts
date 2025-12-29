import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 📍 Obtener correo de un usuario (por nombre o email)
export async function POST(request: Request) {
  try {
    const { usuario } = await request.json()

    if (!usuario || typeof usuario !== 'string') {
      return NextResponse.json({ success: false, error: 'Falta el nombre de usuario' }, { status: 400 })
    }

    const isEmail = usuario.includes('@')
    const encontrado = await prisma.usuario.findFirst({
      where: isEmail
        ? { email: usuario.trim() }
        : { nombre: usuario.trim() }
    })

    if (!encontrado) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (!encontrado.email) {
      return NextResponse.json({ success: false, error: 'Este usuario no tiene correo registrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true, correo: encontrado.email })
  } catch (err) {
    console.error('❌ Error al leer correo:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// 📍 Actualizar correo de un usuario
export async function PATCH(request: Request) {
  try {
    const { usuario, nuevoCorreo } = await request.json()

    if (!usuario || !nuevoCorreo) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const encontrado = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: usuario.trim() },
          { nombre: usuario.trim() }
        ]
      }
    })

    if (!encontrado) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    const actualizado = await prisma.usuario.update({
      where: { id: encontrado.id },
      data: { email: nuevoCorreo.trim() }
    })

    return NextResponse.json({ success: true, correo: actualizado.email })
  } catch (err) {
    console.error('❌ Error al actualizar correo:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}

// 📍 Eliminar correo de un usuario (dejarlo en null)
export async function DELETE(request: Request) {
  try {
    const { usuario } = await request.json()

    if (!usuario) {
      return NextResponse.json({ success: false, error: 'Falta el nombre de usuario' }, { status: 400 })
    }

    const encontrado = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: usuario.trim() },
          { nombre: usuario.trim() }
        ]
      }
    })

    if (!encontrado) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    await prisma.usuario.update({
      where: { id: encontrado.id },
      data: { email: null }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error al eliminar correo:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
