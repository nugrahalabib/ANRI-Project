// API Route: Alerts Management
// Provides alert listing, filtering, and status updates

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build filter conditions
        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (severity && severity !== 'all') {
            where.severity = severity;
        }

        if (type && type !== 'all') {
            where.alertType = type;
        }

        // Fetch alerts with relations
        const [alerts, total] = await Promise.all([
            prisma.anomalyAlert.findMany({
                where,
                include: {
                    document: {
                        select: {
                            id: true,
                            rfidTag: true,
                            title: true,
                            classification: true,
                        },
                    },
                    movement: {
                        include: {
                            fromZone: { select: { id: true, name: true } },
                            toZone: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: [
                    { severity: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.anomalyAlert.count({ where }),
        ]);

        // Parse contributing factors
        const enrichedAlerts = alerts.map(alert => ({
            ...alert,
            contributingFactors: JSON.parse(alert.contributingFactors || '[]'),
        }));

        return NextResponse.json({
            success: true,
            data: enrichedAlerts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Alerts fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, resolutionNotes, resolvedBy } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const validStatuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE', 'ESCALATED'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status value' },
                { status: 400 }
            );
        }

        const updateData: any = { status };

        if (status === 'RESOLVED' || status === 'FALSE_POSITIVE') {
            updateData.resolvedAt = new Date();
            updateData.resolvedBy = resolvedBy;
            updateData.resolutionNotes = resolutionNotes;
        }

        const alert = await prisma.anomalyAlert.update({
            where: { id },
            data: updateData,
            include: {
                document: {
                    select: { id: true, rfidTag: true, title: true },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: alert,
        });
    } catch (error) {
        console.error('Alert update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update alert' },
            { status: 500 }
        );
    }
}
