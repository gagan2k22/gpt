const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTowers() {
    console.log('Updating Towers...');

    try {
        // Delete old towers (this will cascade delete related data, so be careful!)
        // If you have existing data, we'll use upsert instead

        const towers = [
            'Infrastructure',
            'ERP-SAP',
            'Application',
            'CyberSecurity',
            'General',
            'ERP-LN',
            'Digital'
        ];

        console.log('Creating/Updating towers...\n');

        for (let i = 0; i < towers.length; i++) {
            const tower = await prisma.tower.upsert({
                where: { id: i + 1 },
                update: { name: towers[i] },
                create: { name: towers[i] }
            });
            console.log(`✓ ${tower.name}`);
        }

        console.log('\n✅ Towers updated successfully!');

        // Display all towers
        const allTowers = await prisma.tower.findMany({
            include: {
                _count: {
                    select: { budget_heads: true }
                }
            }
        });

        console.log('\nCurrent Towers:');
        allTowers.forEach(tower => {
            console.log(`  - ${tower.name} (ID: ${tower.id}, Budget Heads: ${tower._count.budget_heads})`);
        });

    } catch (error) {
        console.error('Error updating towers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateTowers();
