import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const usuario = body.usuario
    // aceptar tanto "contraseña" como "password"
    const password = body.contraseña || body.password

    // Validación básica de entrada
    if (!usuario || !password || typeof usuario !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })
    }

    // Buscar usuario en la base por email o nombre
    const encontrado = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: usuario.trim() },
          { nombre: usuario.trim() }
        ]
      },
      include: { rango: true } // traer el rango asociado
    })

    // Validar credenciales (si querés validar contraseña)
    if (!encontrado || encontrado.password !== password.trim()) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 })
    }

    // Responder con éxito y rol
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
