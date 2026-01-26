const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDB() {
    try {
        console.log('Testing database connection...');

        const users = await prisma.user.findMany({
            select: {
                email: true,
                name: true,
                role: true,
                isActive: true,
            }
        });

        console.log('\nFound users:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role}) - Active: ${u.isActive}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDB();
