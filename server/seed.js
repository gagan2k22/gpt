const prisma = require('./src/prisma');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('Starting seed...');

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin' }
    });

    const editorRole = await prisma.role.upsert({
        where: { name: 'Editor' },
        update: {},
        create: { name: 'Editor' }
    });

    const viewerRole = await prisma.role.upsert({
        where: { name: 'Viewer' },
        update: {},
        create: { name: 'Viewer' }
    });

    const approverRole = await prisma.role.upsert({
        where: { name: 'Approver' },
        update: {},
        create: { name: 'Approver' }
    });

    // Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@example.com',
            password_hash: hashedPassword,
            is_active: true
        }
    });

    await prisma.userRole.upsert({
        where: {
            user_id_role_id: {
                user_id: adminUser.id,
                role_id: adminRole.id
            }
        },
        update: {},
        create: {
            user_id: adminUser.id,
            role_id: adminRole.id
        }
    });

    // Create Towers
    const infrastructure = await prisma.tower.upsert({
        where: { id: 1 },
        update: { name: 'Infrastructure' },
        create: { name: 'Infrastructure' }
    });

    const erpSAP = await prisma.tower.upsert({
        where: { id: 2 },
        update: { name: 'ERP-SAP' },
        create: { name: 'ERP-SAP' }
    });

    const application = await prisma.tower.upsert({
        where: { id: 3 },
        update: { name: 'Application' },
        create: { name: 'Application' }
    });

    const cyberSecurity = await prisma.tower.upsert({
        where: { id: 4 },
        update: { name: 'CyberSecurity' },
        create: { name: 'CyberSecurity' }
    });

    const general = await prisma.tower.upsert({
        where: { id: 5 },
        update: { name: 'General' },
        create: { name: 'General' }
    });

    const erpLN = await prisma.tower.upsert({
        where: { id: 6 },
        update: { name: 'ERP-LN' },
        create: { name: 'ERP-LN' }
    });

    const digital = await prisma.tower.upsert({
        where: { id: 7 },
        update: { name: 'Digital' },
        create: { name: 'Digital' }
    });

    // Create Budget Heads
    await prisma.budgetHead.upsert({
        where: { id: 1 },
        update: { name: 'Network Connectivity' },
        create: { name: 'Network Connectivity', tower_id: infrastructure.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 2 },
        update: { name: 'IT Infrastructure Cloud Services' },
        create: { name: 'IT Infrastructure Cloud Services', tower_id: infrastructure.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 3 },
        update: { name: 'IT Infrastructure Managed Services' },
        create: { name: 'IT Infrastructure Managed Services', tower_id: infrastructure.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 4 },
        update: { name: 'Software License AMC' },
        create: { name: 'Software License AMC', tower_id: infrastructure.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 5 },
        update: { name: 'Application development & support' },
        create: { name: 'Application development & support', tower_id: application.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 6 },
        update: { name: 'IT Infra HW AMC & Consumables' },
        create: { name: 'IT Infra HW AMC & Consumables', tower_id: infrastructure.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 7 },
        update: { name: 'Other IT Expenses' },
        create: { name: 'Other IT Expenses', tower_id: general.id }
    });

    await prisma.budgetHead.upsert({
        where: { id: 8 },
        update: { name: 'Legal & Consulting Charges' },
        create: { name: 'Legal & Consulting Charges', tower_id: general.id }
    });

    // Create Vendors
    await prisma.vendor.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Tech Solutions Pvt Ltd',
            gst_number: '29ABCDE1234F1Z5',
            contact_person: 'John Doe'
        }
    });

    await prisma.vendor.upsert({
        where: { id: 2 },
        update: {},
        create: {
            name: 'SecureIT Services',
            gst_number: '27XYZAB5678G2W4',
            contact_person: 'Jane Smith'
        }
    });

    // Create Cost Centres
    await prisma.costCentre.upsert({
        where: { code: 'CC-001' },
        update: {},
        create: {
            code: 'CC-001',
            description: 'IT Operations'
        }
    });

    await prisma.costCentre.upsert({
        where: { code: 'CC-002' },
        update: {},
        create: {
            code: 'CC-002',
            description: 'Security Operations'
        }
    });

    // Create PO Entities
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

    for (const entityName of poEntities) {
        await prisma.pOEntity.upsert({
            where: { name: entityName },
            update: {},
            create: { name: entityName }
        });
    }

    // Create Service Types
    await prisma.serviceType.upsert({
        where: { name: 'Shared Service' },
        update: {},
        create: { name: 'Shared Service' }
    });

    await prisma.serviceType.upsert({
        where: { name: 'Dedicated Service' },
        update: {},
        create: { name: 'Dedicated Service' }
    });

    // Create Allocation Bases (FY26 entries from verification image)
    const allocationBases = [
        'FY26-AWS', 'FY26-Asse', 'FY26-Mon', 'FY26-NA-M', 'FY26-Spok',
        'FY26-Trac', 'FY26-DC In', 'FY26-Com', 'FY26-Glob', 'FY26-SAP M',
        'FY26-Emp', 'FY26-Reve', 'FY26-Adob', 'FY26-Anap', 'FY26-Anat',
        'FY26-JGL-M', 'FY26-Chem', 'FY26-Auto', 'FY26-DR-J', 'FY26-Cadi',
        'FY26-LN Li', 'FY26-Azur', 'FY26-India', 'FY26-Conc', 'FY26-Core',
        'FY26-DLP-', 'FY26-Driv', 'FY26-Mast', 'FY26-Licen', 'FY26-Mini',
        'FY26-Sales', 'FY26-SDW', 'FY26-Zoor', 'FY26-Digit', 'FY26-Sum',
        'FY26-EY-C', 'FY26-Rhod', 'FY26-GXP-', 'Licenses'
    ];

    for (const basisName of allocationBases) {
        await prisma.allocationBasis.upsert({
            where: { name: basisName },
            update: {},
            create: { name: basisName }
        });
    }

    console.log('Seed completed successfully!');
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
