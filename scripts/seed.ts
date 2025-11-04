import { config } from 'dotenv';
import { PrismaClient } from '../src/generated/prisma-client/client.js';
import { hashPassword } from '../src/lib/bcrypt.js';

// Загружаем переменные окружения
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем seeding...');

  // Проверяем, есть ли уже пользователи
  const existingUsers = await prisma.user.findMany();
  
  let currentUser;
  let secondUser;

  if (existingUsers.length === 0) {
    // Создаем первого пользователя (текущего)
    console.log('📝 Создаем первого пользователя...');
    const hashedPassword = await hashPassword('password123');
    
    currentUser = await prisma.user.create({
      data: {
        email: 'admin@qonbaq.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Иван',
        lastName: 'Иванов',
        patronymic: 'Иванович',
        phone: '+7 (999) 123-45-67',
        isAdmin: true,
      },
    });
    console.log(`✅ Создан пользователь: ${currentUser.email} (${currentUser.id})`);
  } else {
    // Используем первого существующего пользователя
    currentUser = existingUsers[0];
    console.log(`📌 Используем существующего пользователя: ${currentUser.email} (${currentUser.id})`);
  }

  // Создаем бизнес
  console.log('🏢 Создаем бизнес...');
  let business = await prisma.business.findFirst({
    where: { name: 'Тестовая Компания' },
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Тестовая Компания',
        description: 'Тестовая компания для разработки системы Qonbaq',
      },
    });
    console.log(`✅ Создан бизнес: ${business.name} (${business.id})`);
  } else {
    console.log(`📌 Используем существующий бизнес: ${business.name} (${business.id})`);
  }

  // Создаем Employment для текущего пользователя (как директор)
  console.log('👔 Создаем трудоустройство для текущего пользователя...');
  let currentEmployment = await prisma.employment.findFirst({
    where: {
      userId: currentUser.id,
      businessId: business.id,
    },
  });

  if (!currentEmployment) {
    const hireDate = new Date();
    hireDate.setMonth(hireDate.getMonth() - 6); // 6 месяцев назад

    currentEmployment = await prisma.employment.create({
      data: {
        userId: currentUser.id,
        businessId: business.id,
        position: 'Генеральный директор',
        positionType: 'Руководящая',
        orgPosition: 'Генеральный директор',
        department: 'Руководство',
        hireDate: hireDate,
        workPhone: '+7 (999) 123-45-67',
        workExperience: '6 месяцев',
        accountability: 'ОС',
        personnelNumber: '001',
        isActive: true,
      },
    });
    console.log(`✅ Создано трудоустройство для ${currentUser.email} как ${currentEmployment.position}`);
  } else {
    console.log(`📌 Трудоустройство уже существует для ${currentUser.email}`);
  }

  // Создаем второго пользователя (работник)
  console.log('👤 Создаем второго пользователя (работник)...');
  const secondUserEmail = 'employee@qonbaq.com';
  secondUser = await prisma.user.findUnique({
    where: { email: secondUserEmail },
  });

  if (!secondUser) {
    const hashedPassword2 = await hashPassword('password123');
    secondUser = await prisma.user.create({
      data: {
        email: secondUserEmail,
        username: 'employee',
        password: hashedPassword2,
        firstName: 'Петр',
        lastName: 'Петров',
        patronymic: 'Петрович',
        phone: '+7 (999) 765-43-21',
        isAdmin: false,
      },
    });
    console.log(`✅ Создан второй пользователь: ${secondUser.email} (${secondUser.id})`);
  } else {
    console.log(`📌 Используем существующего второго пользователя: ${secondUser.email} (${secondUser.id})`);
  }

  // Создаем Employment для второго пользователя (как работник)
  console.log('💼 Создаем трудоустройство для второго пользователя...');
  let secondEmployment = await prisma.employment.findFirst({
    where: {
      userId: secondUser.id,
      businessId: business.id,
    },
  });

  if (!secondEmployment) {
    const hireDate2 = new Date();
    hireDate2.setMonth(hireDate2.getMonth() - 3); // 3 месяца назад

    secondEmployment = await prisma.employment.create({
      data: {
        userId: secondUser.id,
        businessId: business.id,
        position: 'Разработчик',
        positionType: 'Специалист',
        orgPosition: 'Должность работника',
        department: 'IT-отдел',
        hireDate: hireDate2,
        workPhone: '+7 (999) 765-43-21',
        workExperience: '3 месяца',
        accountability: 'РМ',
        personnelNumber: '002',
        isActive: true,
      },
    });
    console.log(`✅ Создано трудоустройство для ${secondUser.email} как ${secondEmployment.position}`);
  } else {
    console.log(`📌 Трудоустройство уже существует для ${secondUser.email}`);
  }

  // Создаем пример задачи
  console.log('📋 Создаем пример задачи...');
  const existingTask = await prisma.task.findFirst({
    where: {
      businessId: business.id,
      title: 'Пример задачи',
    },
  });

  if (!existingTask) {
    const task = await prisma.task.create({
      data: {
        businessId: business.id,
        title: 'Пример задачи',
        description: 'Это пример задачи для тестирования системы',
        status: 'PENDING',
        priority: 'MEDIUM',
        assignedTo: secondUser.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через 7 дней
      },
    });
    console.log(`✅ Создана задача: ${task.title} (${task.id})`);
  } else {
    console.log(`📌 Задача уже существует`);
  }

  // Создаем пример документа
  console.log('📄 Создаем пример документа...');
  const existingDoc = await prisma.document.findFirst({
    where: {
      employmentId: currentEmployment.id,
      type: 'employment_contract',
    },
  });

  if (!existingDoc) {
    const document = await prisma.document.create({
      data: {
        category: 'HR',
        type: 'employment_contract',
        title: 'Трудовой договор',
        content: 'Трудовой договор с сотрудником',
        employmentId: currentEmployment.id,
      },
    });
    console.log(`✅ Создан документ: ${document.title} (${document.id})`);
  } else {
    console.log(`📌 Документ уже существует`);
  }

  console.log('\n✨ Seeding завершен успешно!');
  console.log('\n📊 Сводка:');
  console.log(`   - Пользователей: ${await prisma.user.count()}`);
  console.log(`   - Бизнесов: ${await prisma.business.count()}`);
  console.log(`   - Трудоустройств: ${await prisma.employment.count()}`);
  console.log(`   - Задач: ${await prisma.task.count()}`);
  console.log(`   - Документов: ${await prisma.document.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

