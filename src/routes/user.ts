import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

interface ProfileQuery {
  businessId?: string;
}

export async function userRoutes(fastify: FastifyInstance) {
  // Получить список компаний пользователя
  fastify.get(
    '/businesses',
    { preHandler: authenticateToken },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.userId;
        
        fastify.log.info({ userId }, 'Запрос списка компаний пользователя');

        const employments = await prisma.employment.findMany({
          where: {
            userId,
            isActive: true,
          },
          include: {
            business: {
              select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        const businesses = employments.map((employment) => ({
          id: employment.business.id,
          name: employment.business.name,
          description: employment.business.description,
          position: employment.position,
          orgPosition: employment.orgPosition,
          department: employment.department,
          hireDate: employment.hireDate,
          createdAt: employment.business.createdAt,
        }));

        reply.send({
          businesses,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
      }
    }
  );

  // Получить профиль пользователя в контексте компании
  fastify.get<{ Querystring: ProfileQuery }>(
    '/profile',
    { preHandler: authenticateToken },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.userId;
        const query = request.query as ProfileQuery;
        const { businessId } = query;

        // Если businessId не указан, проверяем, есть ли у пользователя только одна компания
        if (!businessId) {
          const employmentCount = await prisma.employment.count({
            where: {
              userId,
              isActive: true,
            },
          });

          if (employmentCount === 0) {
            reply.code(404).send({ error: 'У пользователя нет активных трудоустройств' });
            return;
          }

          if (employmentCount > 1) {
            reply.code(400).send({
              error: 'Необходимо указать businessId в query параметрах',
              message: 'У пользователя несколько компаний. Используйте /user/businesses для получения списка.',
            });
            return;
          }

          // Если только одна компания, берем её автоматически
          const singleEmployment = await prisma.employment.findFirst({
            where: {
              userId,
              isActive: true,
            },
          });

          if (!singleEmployment) {
            reply.code(404).send({ error: 'Трудоустройство не найдено' });
            return;
          }

          const profileData = await getProfileData(fastify, userId, singleEmployment.businessId);
          reply.send(profileData);
          return;
        }

        // Проверяем, что пользователь действительно трудоустроен в этой компании
        const employment = await prisma.employment.findFirst({
          where: {
            userId,
            businessId,
            isActive: true,
          },
        });

        if (!employment) {
          reply.code(404).send({
            error: 'Трудоустройство не найдено',
            message: 'Пользователь не найден в указанной компании или трудоустройство неактивно',
          });
          return;
        }

        const profileData = await getProfileData(fastify, userId, businessId);
        reply.send(profileData);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
      }
    }
  );
}

async function getProfileData(
  fastify: FastifyInstance,
  userId: string,
  businessId: string
) {
  // Получаем пользователя с персональными данными
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      patronymic: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('Пользователь не найден');
  }

  // Получаем данные о трудоустройстве
  const employment = await prisma.employment.findFirst({
    where: {
      userId,
      businessId,
      isActive: true,
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  if (!employment) {
    throw new Error('Трудоустройство не найдено');
  }

  // Получаем документы сотрудника
  const documents = await prisma.document.findMany({
    where: {
      employmentId: employment.id,
      category: 'HR',
    },
    select: {
      id: true,
      category: true,
      type: true,
      title: true,
      fileUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Формируем данные о работнике (как на скриншоте)
  const employeeData = {
    // Фото сотрудника (пока null, будет добавлено позже)
    photo: null,
    // Персональные данные
    lastName: user.lastName,
    firstName: user.firstName,
    patronymic: user.patronymic,
    // Данные о трудоустройстве
    department: employment.department,
    position: employment.position,
    hireDate: employment.hireDate,
    positionType: employment.positionType,
    email: user.email,
    workPhone: employment.workPhone,
    workExperience: employment.workExperience,
    accountability: employment.accountability,
    personnelNumber: employment.personnelNumber,
  };

  // Позиция в организационной структуре
  // На основе orgPosition определяем все возможные роли
  const orgStructure = {
    isGeneralDirector: employment.orgPosition === 'Генеральный директор',
    isProjectManager: employment.orgPosition === 'Руководитель проекта(управления)',
    isDepartmentHead: employment.orgPosition === 'Руководитель отдела',
    isEmployee: employment.orgPosition === 'Должность работника',
    currentPosition: employment.orgPosition,
  };

  // Взаимозаменяемый работник (пока null, будет добавлено позже)
  const interchangeableEmployee = null;

  // Кадровые документы
  const hrDocuments = documents.map((doc) => ({
    id: doc.id,
    type: doc.type,
    title: doc.title,
    fileUrl: doc.fileUrl,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }));

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      patronymic: user.patronymic,
      phone: user.phone,
    },
    business: {
      id: employment.business.id,
      name: employment.business.name,
      description: employment.business.description,
    },
    employment: {
      id: employment.id,
      position: employment.position,
      positionType: employment.positionType,
      orgPosition: employment.orgPosition,
      department: employment.department,
      hireDate: employment.hireDate,
      workPhone: employment.workPhone,
      workExperience: employment.workExperience,
      accountability: employment.accountability,
      personnelNumber: employment.personnelNumber,
      isActive: employment.isActive,
    },
    employeeData,
    orgStructure,
    interchangeableEmployee,
    hrDocuments,
  };
}

