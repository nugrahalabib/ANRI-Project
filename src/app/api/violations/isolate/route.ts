
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { deviceId, reason } = body;

        if (!deviceId) {
            return NextResponse.json(
                { success: false, error: 'Device ID is required' },
                { status: 400 }
            );
        }

        // 1. Find or Create Device Status
        // In a real app, this would query an agent. For demo, we update the DB record.
        const device = await prisma.deviceStatus.upsert({
            where: { deviceId },
            update: {
                status: 'ISOLATED',
                isolatedAt: new Date(),
                isolationReason: reason || 'Manual isolation by administrator',
                updatedAt: new Date()
            },
            create: {
                deviceId,
                ipAddress: '192.168.1.xxx', // Mock if not exists
                status: 'ISOLATED',
                isolatedAt: new Date(),
                isolationReason: reason || 'Manual isolation by administrator'
            }
        });

        // 2. Log Action in Audit Trail (Critical for Governance)
        await prisma.auditLog.create({
            data: {
                action: 'ISOLATE_DEVICE',
                entityType: 'Device',
                entityId: device.id,
                userId: 'user-security-01', // Mock admin
                metadata: JSON.stringify({ reason, deviceId }),
                signature: 'mock-sig-' + Date.now(),
                ipAddress: '127.0.0.1'
            }
        });

        // 3. Create Notification
        await prisma.notification.create({
            data: {
                userId: 'user-admin-01', // Mock target
                type: 'DEVICE_ISOLATED',
                title: 'Device Isolated',
                message: `Device ${deviceId} has been isolated from the network.`,
                severity: 'CRITICAL'
            }
        });

        return NextResponse.json({
            success: true,
            data: device,
            message: `Device ${deviceId} successfully isolated.`
        });

    } catch (error) {
        console.error('Error isolating device:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to isolate device' },
            { status: 500 }
        );
    }
}
