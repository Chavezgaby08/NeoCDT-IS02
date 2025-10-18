import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
