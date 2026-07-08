import client from '@repo/db';

async function main() {
    try {
        const user = await client.user.findFirst();
        if (!user) {
            console.log("No user found");
            return;
        }
        
        console.log("Testing space creation for user:", user.id);
        
        const space = await client.space.create({
            data: {
                name: 'Test Space via script',
                width: 100,
                height: 100,
                creatorId: user.id
            }
        });
        
        console.log("Space created successfully:", space.id);
        
        await client.space.delete({
            where: { id: space.id }
        });
        console.log("Cleanup done.");
    } catch (err) {
        console.error("Failed to create space:", err);
    }
}

main().finally(() => process.exit(0));
