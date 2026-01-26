
const { PrismaClient } = require('./src/generated/prisma');

async function main() {
    console.log('Testing Prisma Connection...');
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: 'file:./prisma/dev.db'
            }
        }
    });

    try {
        const count = await prisma.user.count();
        console.log('Connection successful. User count:', count);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
