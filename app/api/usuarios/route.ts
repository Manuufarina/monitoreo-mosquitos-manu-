import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 📍 Crear usuario
export async function POST(req: Request) {
  try {
    const { usuario, password, rol, nombreApellido } = await req.json()

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
        email: isEmail ? usuario.trim() : "sin-correo", // 👈 nunca null
        password: password.trim(),
        rangoId: rango.id,
        nombreApellido: nombreApellido?.trim() ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      usuario: { 
        id: nuevo.id, 
        nombre: nuevo.nombre, 
        email: nuevo.email, 
        rangoId: nuevo.rangoId,
        nombreApellido: nuevo.nombreApellido
      }
    })
  } catch (err) {
    console.error('❌ Error al crear usuario:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// 📍 Listar usuarios (todos o filtrados por rango)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rango = searchParams.get('rango')

    let usuarios

    if (rango) {
      usuarios = await prisma.usuario.findMany({
        where: { rango: { nombre: rango } },
        orderBy: { creadoEn: 'asc' },
        include: { rango: true },
      })
    } else {
      usuarios = await prisma.usuario.findMany({
        orderBy: { creadoEn: 'asc' },
        include: { rango: true },
      })
    }

    return NextResponse.json({ success: true, usuarios })
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error)
    return NextResponse.json({ success: false, error: 'No se pudo obtener usuarios' }, { status: 500 })
  }
}

// 📍 Actualizar usuario (o quitar rango)
export async function PATCH(req: Request) {
  try {
    const { id, nombre, email, password, rangoId, quitarRango, nombreApellido } = await req.json()

    const data: any = { 
      nombre, 
      email: email?.trim() || "sin-correo", // 👈 nunca null
      password, 
      rangoId, 
      nombreApellido 
    }

    // Si se pide quitar rango, lo dejamos en null
    if (quitarRango) {
      data.rangoId = null
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, usuario: usuarioActualizado })
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error)
    return NextResponse.json({ success: false, error: 'No se pudo actualizar el usuario' }, { status: 500 })
  }
}

// 📍 Eliminar usuario
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    await prisma.usuario.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error)
    return NextResponse.json({ success: false, error: 'No se pudo eliminar el usuario' }, { status: 500 })
  }
}
