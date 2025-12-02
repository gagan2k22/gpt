const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPOEntities() {
    console.log('Adding PO Entities...');

    try {
        const poEntities = [
            'JDI - Radiopharmacies',
            'Ingrevia',
            'JPM Corporate',
            'JIL - JACPL',
            'JDI – Radio Pharmaceuticals',
            'JHS LLC - CMO',
            'Pharmova - API',
            'Biosys - Bengaluru',
            'Biosys - Greater Noida',
            'Biosys - Noida',
            'JGL - Dosage',
            'JPHI Corporate',
            'Cadista - Dosage',
            'JHS GP CMO'
        ];

        console.log('Creating PO Entities...\n');

        for (const entityName of poEntities) {
            const entity = await prisma.pOEntity.upsert({
                where: { name: entityName },
                update: {},
                create: { name: entityName }
            });
            console.log(`✓ ${entity.name}`);
        }

        console.log('\n✅ PO Entities added successfully!');

        // Display all PO entities
        const allEntities = await prisma.pOEntity.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`\nTotal PO Entities: ${allEntities.length}`);

    } catch (error) {
        console.error('Error adding PO entities:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addPOEntities();
