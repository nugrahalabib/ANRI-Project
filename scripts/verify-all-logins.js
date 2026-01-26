// Comprehensive credential verification script
// Tests ALL Quick Login users against the database

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv/config');

const QUICK_LOGIN_USERS = [
    { email: 'admin@anri.go.id', password: 'admin123', role: 'SYSTEM_ADMIN' },
    { email: 'direktur@anri.go.id', password: 'direktur123', role: 'EXECUTIVE' },
    { email: 'security@anri.go.id', password: 'security123', role: 'IT_SECURITY' },
    { email: 'compliance@anri.go.id', password: 'compliance123', role: 'COMPLIANCE_OFFICER' },
];

async function verifyAll() {
    console.log('🔍 COMPREHENSIVE CREDENTIAL VERIFICATION\n');
    console.log('Database:', process.env.DATABASE_URL?.split('@')[1] || 'Not Set');
    console.log('='.repeat(60) + '\n');

    const prisma = new PrismaClient();
    let allPassed = true;

    try {
        for (const expected of QUICK_LOGIN_USERS) {
            console.log(`Testing: ${expected.email}`);

            const user = await prisma.user.findUnique({
                where: { email: expected.email },
                select: { id: true, email: true, name: true, role: true, passwordHash: true, isActive: true }
            });

            if (!user) {
                console.log(`  ❌ USER NOT FOUND in database!`);
                allPassed = false;
                continue;
            }

            console.log(`  Found: ${user.name} (${user.role})`);

            if (user.role !== expected.role) {
                console.log(`  ⚠️  Role mismatch! Expected ${expected.role}, got ${user.role}`);
            }

            if (!user.isActive) {
                console.log(`  ❌ User is INACTIVE!`);
                allPassed = false;
                continue;
            }

            const isValid = await bcrypt.compare(expected.password, user.passwordHash);

            if (isValid) {
                console.log(`  ✅ Password "${expected.password}" VALID\n`);
            } else {
                console.log(`  ❌ Password "${expected.password}" INVALID`);
                console.log(`  Hash: ${user.passwordHash.substring(0, 30)}...`);
                allPassed = false;
            }
        }

        console.log('='.repeat(60));
        if (allPassed) {
            console.log('✅ ALL CREDENTIALS VERIFIED SUCCESSFULLY!');
            console.log('Login should work for all Quick Login users.');
        } else {
            console.log('❌ SOME CREDENTIALS FAILED!');
            console.log('Please re-run: node prisma/seed.js');
        }

    } catch (e) {
        console.error('❌ Verification Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyAll();
