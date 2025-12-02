const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
    console.log('Checking for admin user...');
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@example.com' }
        });

        if (!user) {
            console.log('User NOT FOUND in database.');
        } else {
            console.log('User FOUND:', user.email);
            console.log('Stored Hash:', user.password_hash);

            const isMatch = await bcrypt.compare('password123', user.password_hash);
            console.log('Password match for "password123":', isMatch);

            if (!isMatch) {
                console.log('Resetting password to "password123"...');
                const newHash = await bcrypt.hash('password123', 10);
                await prisma.user.update({
                    where: { email: 'admin@example.com' },
                    data: { password_hash: newHash }
                });
                console.log('Password reset successful.');
            }
        }
    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
