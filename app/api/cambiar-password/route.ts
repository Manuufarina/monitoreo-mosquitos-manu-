import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Validar contraseña actual
    if (encontrado.password !== passwordActual.trim()) {
      return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 })
    }

    // Actualizar contraseña
    await prisma.usuario.update({
      where: { id: encontrado.id }, // ✅ id es string ObjectId
      data: { password: passwordNueva.trim() }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en cambiar-password:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
