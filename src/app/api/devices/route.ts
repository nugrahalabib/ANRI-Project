// API Route: Devices - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');

        const where: Record<string, unknown> = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        const devices = await prisma.deviceStatus.findMany({
            where,
            orderBy: [{ status: 'asc' }, { lastSeen: 'desc' }],
        });

        // Get violation counts per device
        const violationCounts = await prisma.policyViolation.groupBy({
            by: ['deviceId'],
            _count: { id: true },
        });

        const violationMap = new Map(violationCounts.map(v => [v.deviceId, v._count.id]));

        const enrichedDevices = devices.map(device => ({
            ...device,
            violationCount: violationMap.get(device.deviceId) || 0,
        }));

        return NextResponse.json({
            success: true,
            data: enrichedDevices,
            total: enrichedDevices.length,
            summary: {
                active: devices.filter(d => d.status === 'ACTIVE').length,
                suspended: devices.filter(d => d.status === 'SUSPENDED').length,
                isolated: devices.filter(d => d.status === 'ISOLATED').length,
                offline: devices.filter(d => d.status === 'OFFLINE').length,
            },
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch devices' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { deviceId, status, isolationReason } = body;

        if (!deviceId || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = { status };

        if (status === 'ISOLATED') {
            updateData.isolatedAt = new Date();
            updateData.isolationReason = isolationReason;
        } else if (status === 'ACTIVE') {
            updateData.isolatedAt = null;
            updateData.isolationReason = null;
        }

        const device = await prisma.deviceStatus.update({
            where: { deviceId },
            data: updateData,
        });

        return NextResponse.json({ success: true, data: device });
    } catch (error) {
        console.error('Error updating device:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update device' },
            { status: 500 }
        );
    }
}
