// Minimal Test Seed for Prisma 7
require('dotenv/config');

const { PrismaClient } = require('@prisma/client');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Prisma 7: datasource URL comes from prisma.config.ts
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Testing Prisma connection...');

    try {
        await prisma.$connect();
        console.log('✅ Connected to database!');

        // Test simple query
        const count = await prisma.user.count();
        console.log('Current user count:', count);

        // Create test user
        const user = await prisma.user.create({
            data: {
                email: 'test@anri.go.id',
                name: 'Test User',
                passwordHash: 'test123',
                role: 'SYSTEM_ADMIN',
                department: 'IT',
            }
        });
        console.log('✅ Created test user:', user.name);

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ Deleted test user');

        console.log('\n✅ Prisma connection test PASSED!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
