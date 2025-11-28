// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.usuario.upsert({
    where: { email: 'damianholasekcosta@gmail.com' }, // tu email oficial
    update: {},
    create: {
      nombre: 'DAHolasekCosta',                       // tu nombre
      email: 'damianholasekcosta@gmail.com',           // tu email oficial
      password: 'naimad',           // tu contraseña (en producción usaríamos hash)
      permisos: 'admin',                      // rol o permisos
    },
  })
  console.log('✅ Usuario oficial creado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
