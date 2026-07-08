import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() { 
  const user = await prisma.user.findFirst(); 
  if (!user) return console.log('No user'); 
  
  try { 
    // Let's also test map space creation if there's a map
    const map = await prisma.map.findFirst({ include: { mapElements: true } });
    if (map) {
      console.log("Found Map: " + map.id + " with " + map.mapElements.length + " elements");
      const space = await prisma.$transaction(async () => {
          const curr_space = await prisma.space.create({
              data: {
                  name: 'Test Map Space',
                  width: map.width,
                  height: map.height,
                  thumbnail: map.thumbnail,
                  creatorId: user.id,
              }
          });
          await prisma.spaceElements.createMany({
              data: map.mapElements.map(e => ({
                  spaceId: curr_space.id,
                  elementId: e.elementId,
                  x: e.x,
                  y: e.y
              }))
          });
          return curr_space;
      });
      console.log('Success Map Space:', space.id);
      await prisma.spaceElements.deleteMany({ where: { spaceId: space.id } });
      await prisma.space.delete({ where: { id: space.id } });
    }

    const space = await prisma.space.create({ 
      data: { name: 'Test', width: 100, height: 100, creatorId: user.id } 
    }); 
    console.log('Success Empty Space:', space.id); 
    await prisma.space.delete({ where: { id: space.id } }); 

  } catch (e) { 
    console.error('Prisma Error:', e); 
  } 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
