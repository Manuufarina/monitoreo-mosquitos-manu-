import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 📍 Cambiar contraseña
export async function POST(request: Request) {
  try {
    const { usuario, passwordActual, passwordNueva } = await request.json()

    if (!usuario || !passwordActual || !passwordNueva) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Buscar usuario por email o nombre
    const encontrado = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: usuario.trim() },
          { nombre: usuario.trim() }
        ]
      }
    })

    if (!encontrado) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Validar contraseña actual (usando bcrypt si está hasheada)
    const passwordValida = await bcrypt.compare(passwordActual.trim(), encontrado.password)
    if (!passwordValida) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 })
    }

    // Hashear nueva contraseña
    const passwordHasheada = await bcrypt.hash(passwordNueva.trim(), 10)

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: encontrado.id },
      data: { password: passwordHasheada }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en password/route.ts:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
