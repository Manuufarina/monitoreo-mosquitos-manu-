import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { usuario, password, rol } = await request.json()

    // Validación básica de entrada
    if (
      !usuario ||
      !password ||
      !rol ||
      typeof usuario !== 'string' ||
      typeof password !== 'string' ||
      typeof rol !== 'string'
    ) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    // Verificar si ya existe un usuario con ese nombre o email
    const existente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: usuario.trim() },
          { nombre: usuario.trim() }
        ]
      }
    })

    if (existente) {
      return NextResponse.json({ error: 'Usuario ya existe' }, { status: 409 })
    }

    // Crear el nuevo usuario
    await prisma.usuario.create({
      data: {
        nombre: usuario.trim(),
        email: usuario.includes('@') ? usuario.trim() : null, // si es email lo guarda, si no queda null
        password: password.trim(),
        permisos: rol.trim(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error al crear usuario:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
