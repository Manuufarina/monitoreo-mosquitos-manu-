import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toDateOnlyUTC(isoOrDate: string | Date) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

// GET: listar informes (opcionalmente filtrados por trampaId)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const trampaId = searchParams.get('trampaId')

    const informes = await prisma.informe.findMany({
      where: trampaId ? { trampaId } : {},
      orderBy: { fecha: 'desc' },
      include: { trampa: true },
      take: 200,
    })

    return NextResponse.json({ success: true, informes })
  } catch (error) {
    console.error('❌ Error al leer informes:', error)
    return NextResponse.json({ error: 'Error al leer informes' }, { status: 500 })
  }
}

// POST: crear un nuevo informe con número incremental y trampaNumero manual
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      trampaId,        // ObjectId de la zona/pin
      trampaNumero,    // número manual único de la trampa
      fecha,
      grupo,
      hora,
      ronda,
      operadorId,
      ubicacion,
      clima,
      fumigacion,
      estadoDispositivo,
      estadoEnvase,
      anopheles,
      aedes,
      culex,
      ovitrapPositiva,
      larvasPupas,
      emergenciaAdultos,
      cantidadAdultos,
    } = body

    if (!trampaId || !trampaNumero || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const fechaDia = toDateOnlyUTC(fecha)

    // 🔧 Buscar último número de informe
    const ultimo = await prisma.informe.findMany({
      orderBy: { numeroInforme: 'desc' },
      take: 1,
    })
    const nuevoNumeroInforme = ultimo.length > 0 ? (ultimo[0].numeroInforme ?? 0) + 1 : 1

    // armamos el objeto data dinámicamente
    const data: any = {
      trampaId,
      trampaNumero,
      fecha: fechaDia,
      grupo,
      hora,
      ronda,
      ubicacion,
      clima,
      fumigacion,
      estadoDispositivo,
      estadoEnvase,
      anopheles,
      aedes,
      culex,
      ovitrapPositiva,
      larvasPupas,
      emergenciaAdultos,
      cantidadAdultos,
      numeroInforme: nuevoNumeroInforme, // 👈 asignamos manualmente
    }

    if (operadorId && operadorId.trim() !== '') {
      data.operadorId = operadorId
    }

    const nuevo = await prisma.informe.create({ data })

    return NextResponse.json({ success: true, informe: nuevo })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un informe para esa trampa en esa fecha.' },
        { status: 400 }
      )
    }
    console.error('❌ Error al guardar informe:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// PUT: actualizar un informe existente por id
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const {
      id,
      trampaId,
      trampaNumero,
      fecha,
      grupo,
      hora,
      ronda,
      operadorId,
      ubicacion,
      clima,
      fumigacion,
      estadoDispositivo,
      estadoEnvase,
      anopheles,
      aedes,
      culex,
      ovitrapPositiva,
      larvasPupas,
      emergenciaAdultos,
      cantidadAdultos,
    } = body

    if (!id || !trampaId || !trampaNumero || !fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const fechaDia = toDateOnlyUTC(fecha)

    const data: any = {
      trampaId,
      trampaNumero,
      fecha: fechaDia,
      grupo,
      hora,
      ronda,
      ubicacion,
      clima,
      fumigacion,
      estadoDispositivo,
      estadoEnvase,
      anopheles,
      aedes,
      culex,
      ovitrapPositiva,
      larvasPupas,
      emergenciaAdultos,
      cantidadAdultos,
    }

    if (operadorId && operadorId.trim() !== '') {
      data.operadorId = operadorId
    }

    const actualizado = await prisma.informe.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, informe: actualizado })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe otro informe con esa fecha en esta trampa.' },
        { status: 400 }
      )
    }
    console.error('❌ Error al actualizar informe:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}

// DELETE: eliminar informe por id único
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Falta id' }, { status: 400 })
    }

    const eliminado = await prisma.informe.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, informe: eliminado })
  } catch (error) {
    console.error('❌ Error al eliminar informe:', error)
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }
}
