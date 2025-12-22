import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const usuario = body.usuario
    const password = body.contraseña || body.password

    if (!usuario || !password) {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })
    }

    const isEmail = usuario.includes('@')
    const encontrado = await prisma.usuario.findFirst({
      where: isEmail
        ? { email: usuario.trim() }
        : { nombre: usuario.trim() },
      include: { rango: true }
    })

    if (!encontrado || encontrado.password !== password.trim()) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      usuario: encontrado.nombre,
      rol: encontrado.rango?.nombre || 'sin-rango'
    })
  } catch (err) {
    console.error('❌ Error en login:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
