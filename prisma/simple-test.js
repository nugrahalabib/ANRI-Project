
const { PrismaClient } = require('@prisma/client');
require('dotenv/config');

console.log('DEBUG: Starting minimal test');
console.log('DEBUG: Env URL:', process.env.DATABASE_URL);

async function main() {
    console.log('DEBUG: Instantiating client with explicit URL');
    // Try disabling SSL or ensuring it works
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL + "?ssl-mode=DISABLED"
            }
        }
    });
    try {
        console.log('DEBUG: Connecting...');
        await prisma.$connect();
        console.log('DEBUG: Connected! Counting users...');
        const count = await prisma.user.count();
        console.log('DEBUG: User count:', count);
    } catch (e) {
        console.error('DEBUG: Error caught:', e);
    } finally {
        await prisma.$disconnect();
        console.log('DEBUG: Disconnected');
    }
}

main().catch(e => console.error('FATAL:', e));
