const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAllocationBases() {
    console.log('Adding Allocation Bases...');

    try {
        const allocationBases = [
            'FY26-AWS-JVL',
            'FY26-Assets-NA',
            'FY26-Montreal-JDI+JHSGP',
            'FY26-NA-Mailbox',
            'FY26-Spokane',
            'FY26-Trackwise Licenses-JPM',
            'FY26-DC Infra',
            'FY26-Compliancewire',
            'FY26-Global Employee-Exl. Consumer',
            'FY26-SAP Licenses',
            'FY26-Employee-Global',
            'FY26-Revenue',
            'FY26-Global-Mailbox',
            'FY26-Adobe-NA',
            'FY26-Revenue-NA',
            'FY26-Anaplan-Reimplementation',
            'FY26-Anaplan-JGL-API',
            'FY26-Anaplan-Reimplementation-Bio+Spk+Mtl+Cad',
            'FY26-Employee-NA',
            'FY26-Employee-Pharma India',
            'FY26-JGL-IBP-Asset',
            'FY26-ChemAir',
            'FY26-Autocad',
            'FY26-DR-JVL',
            'FY26-Cadista-Aws',
            'FY26-LN Licenses',
            'FY26-AWS-Biosys',
            'FY26-Azure-JVL',
            'FY26-India-Mailbox',
            'FY26-JGL-IBP-Emp',
            'FY26-Concur Usage-SAP Entites',
            'FY26-Corevist',
            'FY26-Assets-Global',
            'FY26-DLP-NA',
            'FY26-Druva-MTL',
            'FY26-Master Control-All',
            'FY26-Employee-Pharma',
            'FY26-Licenses-M365',
            'FY26-Master Control-Cadista',
            'FY26-Master Control-MTL',
            'FY26-Global-Mailbox-With-JFWL',
            'FY26-Montreal-Minitab',
            'FY26-Minitab-License',
            'FY26-JGL-IBP-Mailbox',
            'FY26-Revenue-Excl JVL',
            'FY26-SalesForce-JDI-ABU',
            'FY26-SalesForce-ABU',
            'FY26-SAP Licenses-NA',
            'FY26-SDWAN-JVL',
            'FY26-SDWAN-HO',
            'FY26-Employee-India',
            'FY26-JGL-IBP-IT-Emp',
            'FY26-JGL-IBP-Zoom',
            'FY26-Zoom-NA',
            'FY26-DigiSign',
            'FY26-Summit JDR',
            'FY26-EY-Conformity',
            'FY26-EY-Conformity-NA',
            'FY26-Trackwise-MTL',
            'FY26-Trackwise-SPK',
            'FY26-Rfxcel',
            'FY26-GXP-OPS',
            'FY26-Cadista',
            'Licenses'
        ];

        console.log('Creating Allocation Bases...\n');

        for (const basisName of allocationBases) {
            const basis = await prisma.allocationBasis.upsert({
                where: { name: basisName },
                update: {},
                create: { name: basisName }
            });
            console.log(`✓ ${basis.name}`);
        }

        console.log('\n✅ Allocation Bases added successfully!');

        // Display all allocation bases
        const allBases = await prisma.allocationBasis.findMany({
            orderBy: { name: 'asc' }
        });

        console.log(`\nTotal Allocation Bases: ${allBases.length}`);

    } catch (error) {
        console.error('Error adding allocation bases:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addAllocationBases();
