const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateMasterData() {
    console.log('Updating Master Data...\n');

    try {
        // Update Towers
        console.log('Updating Towers...');

        // Delete ERP & P, add ERP-SAP and ERP-LN
        const towers = [
            'Infrastructure',
            'ERP-SAP',
            'Application',
            'CyberSecurity',
            'General',
            'ERP-LN',
            'Digital'
        ];

        // Clear existing towers
        await prisma.tower.deleteMany({});

        for (const towerName of towers) {
            const tower = await prisma.tower.create({
                data: { name: towerName }
            });
            console.log(`✓ ${tower.name}`);
        }

        // Update PO Entities
        console.log('\nUpdating PO Entities...');

        const poEntities = [
            'JDI - Radiopharmacies',
            'Increvia',
            'JPM Corporate',
            'JIL - JACPL',
            'JDI - Radio Pharmaceuticals',
            'IHS ILC -CMO',
            'Pharmova - API',
            'Biosys - Bengaluru',
            'Biosys - Greater Noida',
            'Biosys - Noida',
            'JGL - Dosage',
            'JPNI Corporate',
            'Cadista - Dosage',
            'JHS GP CMO'
        ];

        // Clear existing PO entities
        await prisma.pOEntity.deleteMany({});

        for (const entityName of poEntities) {
            const entity = await prisma.pOEntity.create({
                data: { name: entityName }
            });
            console.log(`✓ ${entity.name}`);
        }

        // Update Allocation Bases with all FY26 entries
        console.log('\nUpdating Allocation Bases...');

        const allocationBases = [
            'FY26-AWS',
            'FY26-Asse',
            'FY26-Mon',
            'FY26-NA-M',
            'FY26-Spok',
            'FY26-Trac',
            'FY26-DC In',
            'FY26-Com',
            'FY26-Glob',
            'FY26-SAP M',
            'FY26-Emp',
            'FY26-Reve',
            'FY26-Glob',
            'FY26-Adob',
            'FY26-Reve',
            'FY26-Anap',
            'FY26-Anap',
            'FY26-Anat',
            'FY26-Emp',
            'FY26-Emp',
            'FY26-JGL-M',
            'FY26-Chem',
            'FY26-Auto',
            'FY26-AWS',
            'FY26-DR-J',
            'FY26-Cadi',
            'FY26-LN Li',
            'FY26-AWS',
            'FY26-Azur',
            'FY26-India',
            'FY26-JGL-M',
            'FY26-Conc',
            'FY26-Core',
            'FY26-Asse',
            'FY26-DLP-',
            'FY26-Driv',
            'FY26-Mast',
            'FY26-Emp',
            'FY26-Licen',
            'FY26-Mast',
            'FY26-Mast',
            'FY26-Glob',
            'FY26-Mon',
            'FY26-Mini',
            'FY26-JGL-M',
            'FY26-Reve',
            'FY26-Sales',
            'FY26-Sales',
            'FY26-SAP M',
            'FY26-SDW',
            'FY26-SDW',
            'FY26-Emp',
            'FY26-JGL-M',
            'FY26-JGL-M',
            'FY26-Zoor',
            'FY26-Digit',
            'FY26-Sum',
            'FY26-EY-C',
            'FY26-EY-C',
            'FY26-Trac',
            'FY26-Trac',
            'FY26-Rhod',
            'FY26-GXP-',
            'FY26-Cadi',
            'Licenses'
        ];

        // Clear existing allocation bases
        await prisma.allocationBasis.deleteMany({});

        for (const basisName of allocationBases) {
            const basis = await prisma.allocationBasis.create({
                data: { name: basisName }
            });
            console.log(`✓ ${basis.name}`);
        }

        console.log('\n✅ All master data updated successfully!');

    } catch (error) {
        console.error('Error updating master data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateMasterData();
