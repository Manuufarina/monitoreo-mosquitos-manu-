import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const GET = async () => {
  try {
    // Obtener todos los usuarios con su rango asociado
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rango: { select: { nombre: true, reglas: true } }
      },
      orderBy: { nombre: 'asc' } // 👈 ordenar por nombre (campo válido)
    })

    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ error: 'No hay usuarios registrados' }, { status: 404 })
    }

    return NextResponse.json({ success: true, usuarios })
  } catch (error) {
    console.error('❌ Error al cargar permisos:', error)
    return NextResponse.json({ error: 'No se pudieron cargar los permisos' }, { status: 500 })
  }
}
