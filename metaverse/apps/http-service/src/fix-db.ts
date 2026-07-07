import client from "@repo/db";
async function main() {
    const spaceId = "cmrawdo36000bswv2cb17cyce";
    const mapId = "cmrawd0ff000aswv2bql2jkz0";
    const map = await client.map.findUnique({ where: { id: mapId } });
    if (map) {
        await client.space.update({
            where: { id: spaceId },
            data: { thumbnail: map.thumbnail }
        });
        console.log("Updated SPTest with thumbnail!");
    }
}
main().finally(() => client.$disconnect());
