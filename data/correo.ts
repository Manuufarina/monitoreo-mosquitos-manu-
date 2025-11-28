import fs from 'fs'
import path from 'path'

const archivo = path.join(process.cwd(), 'data', 'correos.txt')

export function guardarCorreo(usuario: string, correo: string): boolean {
  try {
    const lineas = fs.existsSync(archivo)
      ? fs.readFileSync(archivo, 'utf8').split('\n').filter(Boolean)
      : []

    const actualizadas = lineas.filter((linea) => !linea.startsWith(`${usuario}:`))
    actualizadas.push(`${usuario}:${correo.trim()}`)

    fs.writeFileSync(archivo, actualizadas.join('\n') + '\n', 'utf8')
    return true
  } catch (err) {
    console.error('❌ Error al guardar correo:', err)
    return false
  }
}

export function obtenerCorreo(usuario: string): string | null {
  try {
    if (!fs.existsSync(archivo)) return null

    const lineas = fs.readFileSync(archivo, 'utf8').split('\n')
    const linea = lineas.find((l) => l.startsWith(`${usuario}:`))
    return linea ? linea.split(':')[1] : null
  } catch (err) {
    console.error('❌ Error al leer correo:', err)
    return null
  }
}
