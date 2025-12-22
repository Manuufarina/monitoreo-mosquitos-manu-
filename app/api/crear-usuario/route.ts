import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { usuario, password, rol } = await request.json()

    if (!usuario || !password || !rol) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const isEmail = usuario.includes('@')
    const nombre = isEmail ? usuario.split('@')[0].trim() || usuario.trim() : usuario.trim()

    // Verificar si ya existe
    const existente = await prisma.usuario.findFirst({
      where: {
        OR: [
          ...(isEmail ? [{ email: usuario.trim() }] : []),
          { nombre }
        ]
      }
    })
    if (existente) {
      return NextResponse.json({ error: 'Usuario ya existe' }, { status: 409 })
    }

    // Buscar el rango por nombre
    const rango = await prisma.rango.findUnique({
      where: { nombre: rol.trim() }
    })
    if (!rango) {
      return NextResponse.json({ error: 'Rango no existe' }, { status: 400 })
    }

    // Crear usuario con referencia al rango
    const nuevo = await prisma.usuario.create({
      data: {
        nombre,
        email: isEmail ? usuario.trim() : null,
        password: password.trim(),
        rangoId: rango.id,
      },
    })

    return NextResponse.json({
      success: true,
      usuario: { id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, rangoId: nuevo.rangoId }
    })
  } catch (err) {
    console.error('❌ Error al crear usuario:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
