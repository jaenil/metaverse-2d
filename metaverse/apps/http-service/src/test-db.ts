import client from "@repo/db";
async function main() {
    const space = await client.space.findFirst({ orderBy: { id: 'desc' } });
    console.log("LATEST SPACE:", space);
    const map = await client.map.findFirst({ orderBy: { id: 'desc' } });
    console.log("LATEST MAP:", map);
}
main().finally(() => client.$disconnect());
