import client from '@repo/db';
async function test() {
  const elements = await client.element.findMany();
  console.log('Elements:', elements.length);
  if (elements.length > 0) {
    const el = elements[0];
    console.log('Deleting element:', el.id);
    try {
      await client.mapElements.deleteMany({ where: { elementId: el.id } });
      await client.spaceElements.deleteMany({ where: { elementId: el.id } });
      await client.element.delete({ where: { id: el.id } });
      console.log('Deleted successfully!');
    } catch(e) {
      console.error('Failed to delete:', e);
    }
  }
}
test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
