const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAuditLogs() {
    try {
        console.log('=== CHECKING AUDIT LOGS ===\n');

        // Get recent login audit logs
        const recentLogins = await prisma.auditLog.findMany({
            where: {
                action: 'USER_LOGIN'
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 10,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        console.log(`Found ${recentLogins.length} recent login audit logs:\n`);

        recentLogins.forEach((log, index) => {
            console.log(`${index + 1}. ${log.user?.name || 'Unknown User'} (${log.user?.email || 'N/A'})`);
            console.log(`   Time: ${log.timestamp.toLocaleString()}`);
            console.log(`   IP: ${log.ipAddress}`);
            console.log(`   Signature: ${log.signature.substring(0, 20)}...`);
            console.log();
        });

        // Check sessions
        const activeSessions = await prisma.session.findMany({
            where: {
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        console.log(`\n=== ACTIVE SESSIONS ===`);
        console.log(`Found ${activeSessions.length} active sessions:\n`);

        activeSessions.forEach((session, index) => {
            console.log(`${index + 1}. ${session.user.name} (${session.user.email})`);
            console.log(`   Created: ${session.createdAt.toLocaleString()}`);
            console.log(`   Expires: ${session.expiresAt.toLocaleString()}`);
            console.log(`   IP: ${session.ipAddress}`);
            console.log();
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAuditLogs();
