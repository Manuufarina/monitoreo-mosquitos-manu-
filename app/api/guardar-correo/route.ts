import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { usuario, correo } = await request.json()

    if (!usuario || !correo) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const isEmail = usuario.includes('@')
    const encontrado = await prisma.usuario.findFirst({
      where: isEmail
        ? { email: usuario.trim() }
        : { nombre: usuario.trim() }
    })

    if (!encontrado) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const existeCorreo = await prisma.usuario.findUnique({
      where: { email: correo.trim() }
    })
    if (existeCorreo) {
      return NextResponse.json({ error: 'Correo ya en uso' }, { status: 409 })
    }

    await prisma.usuario.update({
      where: { id: encontrado.id }, // ✅ id es string ObjectId
      data: { email: correo.trim() }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en guardar-correo:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
