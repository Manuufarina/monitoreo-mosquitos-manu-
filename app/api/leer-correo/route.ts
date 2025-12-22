import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { usuario } = await request.json()

    if (!usuario || typeof usuario !== 'string') {
      return NextResponse.json({ error: 'Falta el nombre de usuario' }, { status: 400 })
    }

    const isEmail = usuario.includes('@')
    const encontrado = await prisma.usuario.findFirst({
      where: isEmail
        ? { email: usuario.trim() }
        : { nombre: usuario.trim() }
    })

    if (!encontrado || !encontrado.email) {
      return NextResponse.json({ error: 'Correo no registrado para este usuario' }, { status: 404 })
    }

    return NextResponse.json({ success: true, correo: encontrado.email })
  } catch (err) {
    console.error('❌ Error al leer correo:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
