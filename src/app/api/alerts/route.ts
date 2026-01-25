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

// POST: Trigger Manual Alerts (Demo Scenario) or Dispatch Actions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, zoneId, notes } = body;

        if (action === 'SIMULATE') {
            // DEMO MAGIC: Create a critical alert instantly
            // Find a random document to "implicate"
            const randomDoc = await prisma.document.findFirst({
                where: { classification: 'SECRET' }
            });

            // 1. Create the Movement FIRST
            const newMovement = await prisma.documentMovement.create({
                data: {
                    documentId: randomDoc?.id || 'missing-id',
                    toZoneId: zoneId || 'zone-l1-id', // Default to Lobby
                    fromZoneId: 'zone-s1-id', // From Server Room
                    readerId: 'reader-mobile-01', // Mock reader
                    isAuthorized: false,
                    riskScore: 0.95
                }
            });

            // 2. Create the Alert linked to the Movement
            const newAlert = await prisma.anomalyAlert.create({
                data: {
                    documentId: randomDoc?.id || 'missing-id',
                    movementId: newMovement.id, // Link manually
                    alertType: 'UNAUTHORIZED_ZONE',
                    severity: 'CRITICAL',
                    riskScore: 0.95,
                    status: 'OPEN',
                    confidence: 0.98,
                    explanation: 'Anomali terdeteksi: Dokumen RAHASIA terdeteksi di Zona Publik (Lobby Utama) tanpa otorisasi pergerakan.',
                    contributingFactors: JSON.stringify([
                        { factor: 'Zona Tidak Sah', weight: 0.8 },
                        { factor: 'Klasifikasi Dokumen', weight: 0.15 },
                        { factor: 'Waktu Tidak Wajar', weight: 0.05 }
                    ])
                },
                include: {
                    document: { select: { id: true, rfidTag: true, title: true, classification: true } },
                    movement: { include: { fromZone: true, toZone: true } }
                }
            });

            return NextResponse.json({ success: true, data: { ...newAlert, contributingFactors: JSON.parse(newAlert.contributingFactors) } });
        }

        return NextResponse.json({ success: false, error: 'Invalid Action' }, { status: 400 });

    } catch (error) {
        console.error('Alert creation error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create alert' }, { status: 500 });
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

        // Handle Dispatch Logic
        if (status === 'INVESTIGATING' && resolutionNotes === 'DISPATCHED_SECURITY') {
            // Logic to notify security team (mock)
            updateData.resolutionNotes = 'Security Team Dispatched at ' + new Date().toLocaleTimeString();
        }

        const alert = await prisma.anomalyAlert.update({
            where: { id },
            data: updateData,
            include: {
                document: {
                    select: { id: true, rfidTag: true, title: true, classification: true },
                },
                movement: { include: { fromZone: true, toZone: true } }
            },
        });

        return NextResponse.json({
            success: true,
            data: { ...alert, contributingFactors: JSON.parse(alert.contributingFactors) },
        });
    } catch (error) {
        console.error('Alert update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update alert' },
            { status: 500 }
        );
    }
}
