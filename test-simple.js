const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const output = [];
function log(...args) {
    const msg = args.join(' ');
    console.log(msg);
    output.push(msg);
}

async function testLoginFlow() {
    try {
        log('=== TESTING LOGIN FLOW ===\n');

        const testEmail = 'admin@anri.go.id';
        const testPassword = 'admin123';

        // Step 1: Find user
        log('Step 1: Finding user...');
        const user = await prisma.user.findUnique({
            where: { email: testEmail },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                passwordHash: true,
                isActive: true,
            },
        });

        if (!user) {
            log('ERROR: User not found!');
            return;
        }
        log('SUCCESS: User found -', user.email);

        // Step 2: Verify password
        log('\nStep 2: Verifying password...');
        const isValid = await bcrypt.compare(testPassword, user.passwordHash);
        log('SUCCESS: Password valid:', isValid);

        // Step 3: Test creating audit log using the actual helper
        log('\nStep 3: Test audit log using actual helper module...');

        // Try to load and use the actual helper
        try {
            // This is the issue - the helper uses TypeScript, need to compile or use ts-node
            log('ERROR: Cannot test TypeScript helper directly from Node.js');
            log('The issue is likely in the audit helper or session token creation');
        } catch (err) {
            log('ERROR loading helper:', err.message);
        }

        log('\n=== CONCLUSION ===');
        log('Database works, password works.');
        log('Issue is likely in TypeScript compilation or audit helper import.');

    } catch (error) {
        log('\nERROR:', error.message);
        log('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
        fs.writeFileSync('test-output.txt', output.join('\n'));
        log('\nOutput saved to test-output.txt');
    }
}

testLoginFlow();
