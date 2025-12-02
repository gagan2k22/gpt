const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateBudgetHeads() {
    console.log('Updating Budget Heads...');

    try {
        // First, let's see what towers exist
        const towers = await prisma.tower.findMany();
        console.log('Available Towers:', towers);

        const infrastructure = towers.find(t => t.name === 'Infrastructure');
        const applications = towers.find(t => t.name === 'Applications');

        if (!infrastructure) {
            console.error('Infrastructure tower not found!');
            return;
        }

        // Delete old budget heads
        await prisma.budgetHead.deleteMany({});
        console.log('Deleted old budget heads');

        // Create new budget heads
        const budgetHeads = [
            { name: 'Network Connectivity', tower_id: infrastructure.id },
            { name: 'IT Infrastructure Cloud Services', tower_id: infrastructure.id },
            { name: 'IT Infrastructure Managed Services', tower_id: infrastructure.id },
            { name: 'Software License AMC', tower_id: infrastructure.id },
            { name: 'Application development & support', tower_id: applications ? applications.id : infrastructure.id },
            { name: 'IT Infra HW AMC & Consumables', tower_id: infrastructure.id },
            { name: 'Other IT Expenses', tower_id: infrastructure.id },
            { name: 'Legal & Consulting Charges', tower_id: infrastructure.id }
        ];

        for (const bh of budgetHeads) {
            const created = await prisma.budgetHead.create({
                data: bh
            });
            console.log(`Created: ${created.name}`);
        }

        console.log('\n✅ Budget Heads updated successfully!');

        // Display all budget heads
        const allBudgetHeads = await prisma.budgetHead.findMany({
            include: { tower: true }
        });

        console.log('\nCurrent Budget Heads:');
        allBudgetHeads.forEach(bh => {
            console.log(`  - ${bh.name} (Tower: ${bh.tower.name})`);
        });

    } catch (error) {
        console.error('Error updating budget heads:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateBudgetHeads();
