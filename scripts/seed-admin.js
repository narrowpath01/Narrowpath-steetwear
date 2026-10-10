const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'narrowpathtshirts@gmail.com';
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      name: 'Narrow Path Admin',
    },
    create: {
      email: adminEmail,
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
