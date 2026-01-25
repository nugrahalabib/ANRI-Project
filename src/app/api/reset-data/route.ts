'use server';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/crypto/auditHelper';

// This endpoint resets all demo data to original state
// Only accessible by SYSTEM_ADMIN role

export async function POST() {
    try {
        // Verify authentication and authorization
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        if (user.role !== 'SYSTEM_ADMIN') {
            return NextResponse.json(
                { error: 'Akses ditolak. Hanya SYSTEM_ADMIN yang dapat mereset data.' },
                { status: 403 }
            );
        }

        // Begin reset process
        const resetStats = {
            alerts: 0,
            movements: 0,
            violations: 0,
            auditLogs: 0,
            sessions: 0,
            notifications: 0,
        };

        // 1. Reset all alerts to OPEN status
        const alertsResult = await prisma.anomalyAlert.updateMany({
            where: {
                status: { not: 'OPEN' },
            },
            data: {
                status: 'OPEN',
                resolvedAt: null,
                resolvedBy: null,
                resolutionNotes: null,
            },
        });
        resetStats.alerts = alertsResult.count;

        // 2. Delete recent document movements (keep baseline from seed)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 1); // Keep data older than 1 day

        // First, remove references from alerts
        await prisma.anomalyAlert.updateMany({
            where: {
                movement: {
                    timestamp: { gte: recentDate },
                },
            },
            data: {
                movementId: null,
            },
        });

        // Then delete recent movements
        const movementsResult = await prisma.documentMovement.deleteMany({
            where: {
                timestamp: { gte: recentDate },
            },
        });
        resetStats.movements = movementsResult.count;

        // 3. Reset policy violations - remove user notification flags
        const violationsResult = await prisma.policyViolation.updateMany({
            data: {
                userNotified: false,
            },
        });
        resetStats.violations = violationsResult.count;

        // 4. Delete audit logs from today (keep historical)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const auditResult = await prisma.auditLog.deleteMany({
            where: {
                timestamp: { gte: todayStart },
            },
        });
        resetStats.auditLogs = auditResult.count;

        // 5. Delete all sessions except current user's
        const sessionsResult = await prisma.session.deleteMany({
            where: {
                userId: { not: user.id },
            },
        });
        resetStats.sessions = sessionsResult.count;

        // 6. Reset notifications to unread
        const notificationsResult = await prisma.notification.updateMany({
            data: {
                isRead: false,
                readAt: null,
            },
        });
        resetStats.notifications = notificationsResult.count;

        // 7. Reset risk posture to baseline
        await prisma.riskPosture.deleteMany({});
        await prisma.riskPosture.create({
            data: {
                overallScore: 32,
                documentRisk: 28,
                digitalRisk: 35,
                complianceRisk: 15,
                criticalCount: 2,
                highCount: 5,
                mediumCount: 12,
                lowCount: 8,
            },
        });

        // Create audit log for reset action
        await createAuditLog({
            action: 'SYSTEM_DATA_RESET',
            entityType: 'System',
            entityId: 'demo-reset',
            userId: user.id,
            details: JSON.stringify({
                resetBy: user.email,
                stats: resetStats,
            }),
        });

        return NextResponse.json({
            success: true,
            message: `Reset berhasil: ${resetStats.alerts} alerts, ${resetStats.movements} movements, ${resetStats.violations} violations direset.`,
            stats: resetStats,
        });
    } catch (error) {
        console.error('Reset data error:', error);
        return NextResponse.json(
            { error: 'Gagal mereset data. Silakan coba lagi.' },
            { status: 500 }
        );
    }
}
