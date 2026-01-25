// API Route: Document Timeline
// Provides movement history for a specific document

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // Fetch document with baseline
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                baselineProfile: true,
                currentZone: true,
            },
        });

        if (!document) {
            return NextResponse.json(
                { success: false, error: 'Document not found' },
                { status: 404 }
            );
        }

        // Fetch movements
        const movements = await prisma.documentMovement.findMany({
            where: {
                documentId: id,
                timestamp: { gte: cutoffDate },
            },
            include: {
                fromZone: { select: { id: true, name: true, code: true } },
                toZone: { select: { id: true, name: true, code: true } },
                reader: { select: { id: true, name: true, readerId: true } },
                anomalyAlert: {
                    select: {
                        id: true,
                        alertType: true,
                        severity: true,
                        riskScore: true,
                        explanation: true,
                        status: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        // Calculate statistics
        const stats = {
            totalMovements: movements.length,
            authorizedMovements: movements.filter(m => m.isAuthorized).length,
            anomalies: movements.filter(m => m.anomalyAlert).length,
            avgRiskScore: movements.length > 0
                ? movements.reduce((sum, m) => sum + m.riskScore, 0) / movements.length
                : 0,
        };

        // Group movements by day for chart
        const dailyStats = new Map<string, { count: number; anomalies: number }>();
        movements.forEach(m => {
            const day = m.timestamp.toISOString().split('T')[0];
            const current = dailyStats.get(day) || { count: 0, anomalies: 0 };
            current.count++;
            if (m.anomalyAlert) current.anomalies++;
            dailyStats.set(day, current);
        });

        // Build timeline entries
        const timeline = movements.map(m => ({
            id: m.id,
            timestamp: m.timestamp,
            fromZone: m.fromZone,
            toZone: m.toZone,
            reader: m.reader,
            isAuthorized: m.isAuthorized,
            riskScore: m.riskScore,
            anomaly: m.anomalyAlert,
        }));

        return NextResponse.json({
            success: true,
            data: {
                document: {
                    id: document.id,
                    rfidTag: document.rfidTag,
                    title: document.title,
                    classification: document.classification,
                    currentZone: document.currentZone,
                    baseline: document.baselineProfile ? {
                        normalHoursStart: document.baselineProfile.normalHoursStart,
                        normalHoursEnd: document.baselineProfile.normalHoursEnd,
                        typicalMovementFreq: document.baselineProfile.typicalMovementFreq,
                        confidenceScore: document.baselineProfile.confidenceScore,
                    } : null,
                },
                timeline,
                stats,
                dailyStats: Array.from(dailyStats.entries()).map(([date, data]) => ({
                    date,
                    ...data,
                })),
            },
        });
    } catch (error) {
        console.error('Document timeline error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch document timeline' },
            { status: 500 }
        );
    }
}
