require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const nuevoUsuario = await prisma.usuario.create({
    data: {
      nombre: 'Damian',
      email: 'damian@example.com',
      password: '123456',
    },
  })
  console.log('Usuario creado:', nuevoUsuario)

  const usuarios = await prisma.usuario.findMany()
  console.log('Usuarios en la base:', usuarios)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
