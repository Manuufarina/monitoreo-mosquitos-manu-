import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🚀 Entrando a seed...")

  // Creamos rango admin si no existe
  const rangoAdmin = await prisma.rango.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
      reglas: { acceso: 'total' },
    },
  })

  // Creamos usuario admin asociado al rango
  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: 'damianholasekcosta@gmail.com' },
    update: {},
    create: {
      nombre: 'DAHolasekCosta',
      email: 'damianholasekcosta@gmail.com',
      password: 'naimad',
      rangoId: rangoAdmin.id,
    },
  })

  console.log('✅ Usuario oficial creado con rango admin:', usuarioAdmin)
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
