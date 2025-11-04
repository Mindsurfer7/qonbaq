import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma-client/client.js';

config();

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Использование: tsx scripts/add-employment.ts <userEmail> [businessName]');
    console.log('Пример: tsx scripts/add-employment.ts bambam@icloud.com "Моя компания"');
    process.exit(1);
  }

  const userEmail = args[0];
  const businessName = args[1] || 'Тестовая Компания';

  console.log(`🔍 Ищем пользователя: ${userEmail}`);

  // Пробуем найти по email или username
  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: { username: userEmail },
    });
  }

  if (!user) {
    console.error(`❌ Пользователь с email/username ${userEmail} не найден`);
    console.log('\n📋 Доступные пользователи:');
    const allUsers = await prisma.user.findMany({
      select: { email: true, username: true, id: true },
    });
    allUsers.forEach((u) => {
      console.log(`   - ${u.email} (username: ${u.username})`);
    });
    process.exit(1);
  }

  console.log(`✅ Найден пользователь: ${user.email} (${user.id})`);

  // Ищем или создаем бизнес
  let business = await prisma.business.findFirst({
    where: { name: businessName },
  });

  if (!business) {
    console.log(`📦 Создаем бизнес: ${businessName}`);
    business = await prisma.business.create({
      data: {
        name: businessName,
        description: `Компания для ${user.email}`,
      },
    });
    console.log(`✅ Создан бизнес: ${business.name} (${business.id})`);
  } else {
    console.log(`📦 Используем существующий бизнес: ${business.name} (${business.id})`);
  }

  // Проверяем, есть ли уже employment
  const existingEmployment = await prisma.employment.findFirst({
    where: {
      userId: user.id,
      businessId: business.id,
    },
  });

  if (existingEmployment) {
    console.log(`⚠️  Трудоустройство уже существует для этого пользователя и компании`);
    console.log(`   Employment ID: ${existingEmployment.id}`);
    console.log(`   Должность: ${existingEmployment.position || 'не указана'}`);
    process.exit(0);
  }

  // Создаем employment
  console.log(`👔 Создаем трудоустройство...`);
  const hireDate = new Date();
  hireDate.setMonth(hireDate.getMonth() - 1); // Месяц назад

  const employment = await prisma.employment.create({
    data: {
      userId: user.id,
      businessId: business.id,
      position: 'Генеральный директор',
      positionType: 'Руководящая',
      orgPosition: 'Генеральный директор',
      department: 'Руководство',
      hireDate: hireDate,
      workPhone: user.phone || null,
      workExperience: '1 месяц',
      accountability: 'ОС',
      personnelNumber: '001',
      isActive: true,
    },
  });

  console.log(`✅ Создано трудоустройство:`);
  console.log(`   ID: ${employment.id}`);
  console.log(`   Должность: ${employment.position}`);
  console.log(`   Компания: ${business.name}`);
  console.log(`\n✨ Готово! Теперь пользователь ${user.email} может видеть компанию ${business.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

