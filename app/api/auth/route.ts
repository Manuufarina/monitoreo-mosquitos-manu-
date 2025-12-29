import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, usuario, password, contraseña, rol } = body

    // Normalizar password (acepta "password" o "contraseña")
    const pass = contraseña || password

    if (!usuario || !pass) {
      return NextResponse.json({ success: false, error: 'Datos inválidos' }, { status: 400 })
    }

    // 📍 LOGIN (cuando action === 'login' o cuando no se envía action)
    if (!action || action === 'login') {
      const isEmail = usuario.includes('@')
      const encontrado = await prisma.usuario.findFirst({
        where: isEmail ? { email: usuario.trim() } : { nombre: usuario.trim() },
        include: { rango: true },
      })

      if (!encontrado) {
        return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
      }

      let valido = false
      try {
        // intenta comparar como hash
        valido = await bcrypt.compare(pass.trim(), encontrado.password)
      } catch {
        // si falla, compara directo
        valido = encontrado.password === pass.trim()
      }

      // fallback: si la contraseña guardada no parece hash, compara directo
      if (!valido) {
        if (!encontrado.password.startsWith('$2')) {
          valido = encontrado.password === pass.trim()
        }
      }

      if (!valido) {
        return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 })
      }

      return NextResponse.json({
        success: true,
        id: encontrado.id,
        usuario: encontrado.nombre,
        email: encontrado.email || null,
        rol: encontrado.rango?.nombre || 'sin-rango', // 🔹 siempre devuelve string
      })
    }

    // 📍 REGISTRO (igual que antes, no se toca)
    if (action === 'register') {
      if (!rol) {
        return NextResponse.json({ success: false, error: 'Falta rol' }, { status: 400 })
      }

      const isEmail = usuario.includes('@')
      const nombre = isEmail ? usuario.split('@')[0].trim() : usuario.trim()

      const existente = await prisma.usuario.findFirst({
        where: { OR: [{ email: usuario.trim() }, { nombre }] },
      })
      if (existente) {
        return NextResponse.json({ success: false, error: 'Usuario ya existe' }, { status: 409 })
      }

      const rango = await prisma.rango.findUnique({ where: { nombre: rol.trim() } })
      if (!rango) {
        return NextResponse.json({ success: false, error: 'Rango no existe' }, { status: 400 })
      }

      const passwordHasheada = await bcrypt.hash(pass.trim(), 10)

      const nuevo = await prisma.usuario.create({
        data: {
          nombre,
          email: isEmail ? usuario.trim() : null,
          password: passwordHasheada,
          rangoId: rango.id,
        },
      })

      return NextResponse.json({
        success: true,
        usuario: { id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, rol: rol },
      })
    }

    return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 })
  } catch (err) {
    console.error('❌ Error en auth/route.ts:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
