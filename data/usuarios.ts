import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

export async function validarCredenciales(usuario: string, password: string): Promise<{ success: boolean, rol?: string }> {
  const archivoUsuarios = path.join(process.cwd(), 'data', 'usuarios.txt')

  if (!fs.existsSync(archivoUsuarios)) {
    return { success: false }
  }

  const contenido = fs.readFileSync(archivoUsuarios, 'utf-8')
  const linea = contenido
    .split('\n')
    .find((linea) => linea.startsWith(`${usuario}:`))

  if (!linea) {
    return { success: false }
  }

  const [_, hash, rol] = linea.split(':')

  const esValida = await bcrypt.compare(password, hash)

  return esValida ? { success: true, rol } : { success: false }
}

