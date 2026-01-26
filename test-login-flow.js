// Comprehensive login flow test to identify the exact error point
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLoginFlow() {
    try {
        console.log('=== TESTING LOGIN FLOW STEP BY STEP ===\n');

        const testEmail = 'admin@anri.go.id';
        const testPassword = 'admin123';

        // Step 1: Find user
        console.log('Step 1: Finding user...');
        const user = await prisma.user.findUnique({
            where: { email: testEmail },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                passwordHash: true,
                isActive: true,
            },
        });

        if (!user) {
            console.error('✗ User not found!');
            return;
        }
        console.log('✓ User found:', user.email, '-', user.name);
        console.log('  Active:', user.isActive);
        console.log('  Role:', user.role);

        // Step 2: Verify password
        console.log('\nStep 2: Verifying password...');
        const isValid = await bcrypt.compare(testPassword, user.passwordHash);
        if (!isValid) {
            console.error('✗ Password verification failed!');
            return;
        }
        console.log('✓ Password is valid');

        // Step 3: Test session creation
        console.log('\nStep 3: Testing session creation...');
        const sessionId = 'test-session-' + Date.now();
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

        try {
            const session = await prisma.session.create({
                data: {
                    id: sessionId,
                    userId: user.id,
                    token: 'test-token',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    expiresAt,
                },
            });
            console.log('✓ Session created:', session.id);

            // Clean up test session
            await prisma.session.delete({ where: { id: sessionId } });
            console.log('✓ Test session cleaned up');
        } catch (error) {
            console.error('✗ Session creation failed:', error.message);
            throw error;
        }

        // Step 4: Test audit log creation
        console.log('\nStep 4: Testing audit log creation...');
        try {
            const crypto = require('crypto');

            // Get the previous log entry for chain linking
            const previousLog = await prisma.auditLog.findFirst({
                orderBy: { timestamp: 'desc' },
                select: { signature: true, timestamp: true },
            });
            console.log('  Previous log found:', !!previousLog);

            // Create a simple audit log
            const testData = {
                action: 'TEST_LOGIN',
                entityType: 'User',
                entityId: user.id,
            };

            // Generate signature (simplified version)
            const secret = process.env.AUDIT_SIGNING_KEY || 'default-secret';
            const dataToSign = JSON.stringify(testData);
            const signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

            const auditLog = await prisma.auditLog.create({
                data: {
                    action: testData.action,
                    entityType: testData.entityType,
                    entityId: testData.entityId,
                    userId: user.id,
                    previousValue: null,
                    newValue: null,
                    metadata: JSON.stringify({ test: true }),
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    signature: signature,
                    previousHash: null,
                    timestamp: new Date(),
                },
            });
            console.log('✓ Audit log created:', auditLog.id);

            // Clean up test audit log
            await prisma.auditLog.delete({ where: { id: auditLog.id } });
            console.log('✓ Test audit log cleaned up');
        } catch (error) {
            console.error('✗ Audit log creation failed:', error.message);
            console.error('  Stack:', error.stack);
            throw error;
        }

        console.log('\n=== ALL STEPS PASSED ===');
        console.log('The login flow components work individually.');
        console.log('Issue might be in the JWT signing or cookie setting.');

    } catch (error) {
        console.error('\n=== TEST FAILED ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testLoginFlow();
