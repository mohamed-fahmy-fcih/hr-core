const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@hr.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log('Admin already exists.');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  await prisma.user.create({
    data: {
      fullName: 'Admin User',
      email,
      passwordHash,
      role: 'admin'
    }
  });

  console.log('Admin user created: admin@hr.com / admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
