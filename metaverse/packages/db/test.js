const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const space = await prisma.space.findFirst({ orderBy: { id: 'desc' } });
  console.log('Latest space thumbnail:', space.thumbnail);
}
main().finally(() => prisma.$disconnect());
