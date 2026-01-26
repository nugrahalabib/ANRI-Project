
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv/config');

async function verify() {
    console.log('🔍 VERIFICATION START');
    console.log('DB URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not Set');

    const prisma = new PrismaClient();

    try {
        const email = 'admin@anri.go.id';
        const password = 'admin123';

        console.log(`\nChecking user: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error('❌ User NOT FOUND in database!');
            return;
        }

        console.log('✅ User found:', user.name);
        console.log('   Role:', user.role);
        console.log('   Hash:', user.passwordHash.substring(0, 20) + '...');

        console.log(`\nTesting bcrypt compare('${password}')...`);
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (isValid) {
            console.log('✅ PASSWORD VALID MATCH! The database has the correct credentials.');
        } else {
            console.error('❌ PASSWORD MISMATCH! The hash in DB does not match "admin123".');
            console.log('   This means the seed script did not update the password correctly.');
        }

    } catch (e) {
        console.error('❌ Verification Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
