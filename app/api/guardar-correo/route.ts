import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { usuario, correo } = await request.json()

    // Validación básica de entrada
    if (
      !usuario ||
      !correo ||
      typeof usuario !== 'string' ||
      typeof correo !== 'string'
    ) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    // Buscar usuario en la base por nombre o id/email
    const encontrado = await prisma.usuario.findFirst({
      where: {
        OR: [
          { nombre: usuario.trim() },
          { email: usuario.trim() }
        ]
      }
    })

    if (!encontrado) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Validar que el correo no esté ya en uso
    const existeCorreo = await prisma.usuario.findUnique({
      where: { email: correo.trim() }
    })
    if (existeCorreo) {
      return NextResponse.json({ error: 'Correo ya en uso' }, { status: 409 })
    }

    // Actualizar el correo del usuario
    await prisma.usuario.update({
      where: { id: encontrado.id },
      data: { email: correo.trim() }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en guardar-correo:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
