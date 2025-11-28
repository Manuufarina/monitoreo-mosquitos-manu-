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
        creadoEn: true,
        rango: { select: { nombre: true, reglas: true } } // 👈 en lugar de permisos
      },
      orderBy: { id: 'asc' }
    })

    // Si no hay usuarios, devolvemos un error
    if (!usuarios || usuarios.length === 0) {
      return NextResponse.json({ error: 'No hay usuarios registrados' }, { status: 404 })
    }

    return NextResponse.json({ success: true, usuarios })
  } catch (error) {
    console.error('❌ Error al cargar permisos:', error)
    return NextResponse.json({ error: 'No se pudieron cargar los permisos' }, { status: 500 })
  }
}
