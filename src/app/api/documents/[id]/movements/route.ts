import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Find document
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                currentZone: true,
            }
        });

        if (!document) {
            return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
        }

        // Get all movements for this document
        const movements = await prisma.documentMovement.findMany({
            where: { documentId: id },
            include: {
                fromZone: true,
                toZone: true,
                reader: true,
            },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        // Get alerts for this document
        const alerts = await prisma.anomalyAlert.findMany({
            where: { documentId: id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json({
            success: true,
            data: {
                document: {
                    id: document.id,
                    rfidTag: document.rfidTag,
                    title: document.title,
                    classification: document.classification,
                    organizationUnit: document.organizationUnit,
                    currentZone: document.currentZone,
                },
                movements: movements.map((m: typeof movements[number]) => ({
                    id: m.id,
                    timestamp: m.timestamp.toISOString(),
                    fromZone: m.fromZone ? { id: m.fromZone.id, name: m.fromZone.name, code: m.fromZone.code } : null,
                    toZone: m.toZone ? { id: m.toZone.id, name: m.toZone.name, code: m.toZone.code } : null,
                    reader: m.reader ? { id: m.reader.readerId, name: m.reader.name, type: m.reader.type } : null,
                    isAuthorized: m.isAuthorized,
                    riskScore: m.riskScore,
                })),
                alerts: alerts.map((a: typeof alerts[number]) => ({
                    id: a.id,
                    alertType: a.alertType,
                    severity: a.severity,
                    explanation: a.explanation,
                    createdAt: a.createdAt.toISOString(),
                })),
                totalMovements: movements.length,
            }
        });
    } catch (error) {
        console.error('Error fetching document movements:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
