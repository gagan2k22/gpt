const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRolesAndUsers() {
    console.log('Starting role and user seeding...');

    try {
        // Create roles
        const roles = ['Viewer', 'Editor', 'Approver', 'Admin'];

        console.log('Creating roles...');
        for (const roleName of roles) {
            await prisma.role.upsert({
                where: { name: roleName },
                update: {},
                create: { name: roleName }
            });
            console.log(`✓ Role created/updated: ${roleName}`);
        }

        // Create admin user if doesn't exist
        console.log('\nCreating admin user...');
        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminRole = await prisma.role.findUnique({
                where: { name: 'Admin' }
            });

            const adminUser = await prisma.user.create({
                data: {
                    name: 'Admin User',
                    email: adminEmail,
                    password_hash: hashedPassword,
                    is_active: true,
                    roles: {
                        create: {
                            role_id: adminRole.id
                        }
                    }
                }
            });

            console.log(`✓ Admin user created: ${adminEmail}`);
            console.log(`  Password: ${adminPassword}`);
        } else {
            console.log(`✓ Admin user already exists: ${adminEmail}`);
        }

        // Create sample users for each role
        console.log('\nCreating sample users...');

        const sampleUsers = [
            { name: 'John Viewer', email: 'viewer@example.com', role: 'Viewer' },
            { name: 'Jane Editor', email: 'editor@example.com', role: 'Editor' },
            { name: 'Bob Approver', email: 'approver@example.com', role: 'Approver' }
        ];

        for (const userData of sampleUsers) {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash('password123', 10);
                const role = await prisma.role.findUnique({
                    where: { name: userData.role }
                });

                await prisma.user.create({
                    data: {
                        name: userData.name,
                        email: userData.email,
                        password_hash: hashedPassword,
                        is_active: true,
                        roles: {
                            create: {
                                role_id: role.id
                            }
                        }
                    }
                });

                console.log(`✓ User created: ${userData.email} (${userData.role})`);
            } else {
                console.log(`✓ User already exists: ${userData.email}`);
            }
        }

        console.log('\n✅ Role and user seeding completed successfully!');
        console.log('\nDefault credentials:');
        console.log('  Email: admin@example.com, Password: password123');
        console.log('  Email: viewer@example.com, Password: password123');
        console.log('  Email: editor@example.com, Password: password123');
        console.log('  Email: approver@example.com, Password: password123');

    } catch (error) {
        console.error('❌ Error seeding roles and users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    seedRolesAndUsers()
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = seedRolesAndUsers;
