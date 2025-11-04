import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma-client/client.js';
import { hashPassword } from '../src/lib/bcrypt.js';

config();

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Использование: tsx scripts/update-password.ts <userEmail> <newPassword>');
    console.log('Пример: tsx scripts/update-password.ts bambam@icloud.com "bambam@icloud.com"');
    process.exit(1);
  }

  const userEmail = args[0];
  const newPassword = args[1];

  console.log(`🔍 Ищем пользователя: ${userEmail}`);

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`❌ Пользователь с email ${userEmail} не найден`);
    console.log('\n📋 Доступные пользователи:');
    const allUsers = await prisma.user.findMany({
      select: { email: true, username: true },
    });
    allUsers.forEach((u) => {
      console.log(`   - ${u.email} (username: ${u.username})`);
    });
    process.exit(1);
  }

  console.log(`✅ Найден пользователь: ${user.email}`);
  console.log(`🔐 Хешируем новый пароль...`);

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  console.log(`✅ Пароль успешно обновлен для ${user.email}`);
  console.log(`   Новый пароль: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

