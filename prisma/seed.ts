import { PrismaClient,Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123', 10);

  const users = [
    {
      email: 'admin@demo.com',
      password,
      firstName: 'John',
      lastName: 'Doe',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: Role.ADMIN,
    },
    {
      email: 'user@demo.com',
      password,
      firstName: 'Jane',
      lastName: 'Roe',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      role: Role.USER,
    },
  ];

  // insert users
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log(`✅ Seeded ${users.length} users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
