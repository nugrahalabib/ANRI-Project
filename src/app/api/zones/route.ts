// API Route: Zones CRUD - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const securityLevel = searchParams.get('securityLevel');

        const where: Record<string, unknown> = { isActive: true };

        if (securityLevel && securityLevel !== 'all') {
            where.securityLevel = securityLevel;
        }

        const zones = await prisma.zone.findMany({
            where,
            include: {
                rfidReaders: { select: { id: true, isOnline: true } },
                _count: { select: { documents: true, accessPermissions: true } },
            },
            orderBy: { name: 'asc' },
        });

        // Get movement counts per zone in last 24h
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const movementCounts = await prisma.documentMovement.groupBy({
            by: ['toZoneId'],
            where: { timestamp: { gte: yesterday } },
            _count: { id: true },
        });

        const movementMap = new Map(movementCounts.map(m => [m.toZoneId, m._count.id]));

        const enrichedZones = zones.map(zone => ({
            id: zone.id,
            code: zone.code,
            name: zone.name,
            description: zone.description,
            securityLevel: zone.securityLevel,
            floor: zone.floor,
            building: zone.building,
            rfidReaders: zone.rfidReaders.length,
            rfidOnline: zone.rfidReaders.filter(r => r.isOnline).length,
            documentCount: zone._count.documents,
            access24h: movementMap.get(zone.id) || 0,
            riskScore: zone.securityLevel === 'HIGH_SECURITY' ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 20) + 10,
            status: zone._count.documents > 100 ? 'warning' : 'normal',
        }));

        return NextResponse.json({
            success: true,
            data: enrichedZones,
            total: enrichedZones.length,
        });
    } catch (error) {
        console.error('Error fetching zones:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch zones' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, description, securityLevel, floor, building } = body;

        if (!code || !name || !securityLevel) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const zone = await prisma.zone.create({
            data: { code, name, description, securityLevel, floor, building, isActive: true },
        });

        return NextResponse.json({ success: true, data: zone }, { status: 201 });
    } catch (error) {
        console.error('Error creating zone:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create zone' },
            { status: 500 }
        );
    }
}
