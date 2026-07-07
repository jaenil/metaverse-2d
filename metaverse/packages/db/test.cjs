const { PrismaClient } = require('./src/generated/prisma/index.js');
const prisma = new PrismaClient();
async function main() {
  const space = await prisma.space.findFirst({ orderBy: { id: 'desc' } });
  console.log('Latest space thumbnail:', space?.thumbnail);
}
main().finally(() => prisma.$disconnect());
