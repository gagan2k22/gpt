const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    console.log('========================================');
    console.log('DATABASE VERIFICATION');
    console.log('========================================\n');

    try {
        // Check Towers
        const towers = await prisma.tower.findMany();
        console.log(`✓ Towers: ${towers.length} found`);
        towers.forEach(t => console.log(`  - ${t.name}`));
        console.log();

        // Check Budget Heads
        const budgetHeads = await prisma.budgetHead.findMany({
            include: { tower: true }
        });
        console.log(`✓ Budget Heads: ${budgetHeads.length} found`);
        budgetHeads.forEach(bh => console.log(`  - ${bh.name} (Tower: ${bh.tower.name})`));
        console.log();

        // Check Vendors
        const vendors = await prisma.vendor.findMany();
        console.log(`✓ Vendors: ${vendors.length} found`);
        console.log();

        // Check Cost Centres
        const costCentres = await prisma.costCentre.findMany();
        console.log(`✓ Cost Centres: ${costCentres.length} found`);
        console.log();

        // Check PO Entities
        const poEntities = await prisma.pOEntity.findMany();
        console.log(`✓ PO Entities: ${poEntities.length} found`);
        poEntities.forEach(pe => console.log(`  - ${pe.name}`));
        console.log();

        // Check Service Types
        const serviceTypes = await prisma.serviceType.findMany();
        console.log(`✓ Service Types: ${serviceTypes.length} found`);
        serviceTypes.forEach(st => console.log(`  - ${st.name}`));
        console.log();

        // Check Allocation Bases
        const allocationBases = await prisma.allocationBasis.findMany();
        console.log(`✓ Allocation Bases: ${allocationBases.length} found`);
        allocationBases.forEach(ab => console.log(`  - ${ab.name}`));
        console.log();

        console.log('========================================');
        console.log('SUMMARY');
        console.log('========================================');
        console.log(`Towers: ${towers.length}`);
        console.log(`Budget Heads: ${budgetHeads.length}`);
        console.log(`Vendors: ${vendors.length}`);
        console.log(`Cost Centres: ${costCentres.length}`);
        console.log(`PO Entities: ${poEntities.length}`);
        console.log(`Service Types: ${serviceTypes.length}`);
        console.log(`Allocation Bases: ${allocationBases.length}`);

    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
