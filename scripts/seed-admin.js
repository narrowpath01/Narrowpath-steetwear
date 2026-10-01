const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'narrowpathtshirts@gmail.com' },
    update: {
      role: 'ADMIN',
      name: 'Narrow Path Admin',
    },
    create: {
      email: 'narrowpathtshirts@gmail.com',
      name: 'Narrow Path Admin',
      role: 'ADMIN',
    },
  });
  console.log('Admin user initialized successfully:', user.email, 'Role:', user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
