// API Route: Zones CRUD - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Default zone layout coordinates for floor plan visualization
const zoneLayoutMap: Record<string, { x: number; y: number; w: number; h: number }> = {
    'ARCH-SEC': { x: 100, y: 100, w: 280, h: 200 },   // Ruang Arsip Rahasia
    'DIG-01': { x: 420, y: 100, w: 280, h: 200 },   // Ruang Digitalisasi
    'OFF-01': { x: 740, y: 100, w: 280, h: 200 },   // Kantor Kearsipan
    'SVR-01': { x: 1060, y: 100, w: 240, h: 200 },  // Ruang Server
    'VIP-01': { x: 100, y: 340, w: 200, h: 180 },   // Ruang Rapat VIP
    'STORE-01': { x: 340, y: 340, w: 200, h: 180 },   // Gudang Penyimpanan
    'LOBBY': { x: 580, y: 340, w: 320, h: 180 },   // Lobby Utama
    'READ-01': { x: 940, y: 340, w: 360, h: 180 },   // Ruang Baca Publik
};

// Fallback grid layout for zones without specific coordinates
const getDefaultLayout = (index: number) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    return {
        x: 100 + col * 380,
        y: 100 + row * 240,
        w: 280,
        h: 200
    };
};

// GET: Fetch all zones with enriched status for Command Center
export async function GET(request: NextRequest) {
    try {
        const zones = await prisma.zone.findMany({
            include: {
                _count: {
                    select: {
                        documents: true,
                        rfidReaders: true,
                        movementsTo: {
                            where: { isAuthorized: false } // Count unauthorized entries as alerts
                        }
                    }
                },
                rfidReaders: {
                    select: { isOnline: true, type: true }
                }
            },
            orderBy: { code: 'asc' }
        });

        // Transform for frontend
        const enrichedZones = zones.map((zone: any, index: number) => {
            const layout = zoneLayoutMap[zone.code] || getDefaultLayout(index);
            return {
                ...zone,
                x_coord: layout.x,
                y_coord: layout.y,
                width: layout.w,
                height: layout.h,
                activeAlerts: zone._count.movementsTo || 0,
                documentCount: zone._count.documents || 0,
                access24h: Math.floor(Math.random() * 50) + 10, // Mock for demo
                riskScore: zone.status === 'LOCKDOWN' ? 100 : (Math.floor(Math.random() * 30) + (zone.securityLevel === 'HIGH_SECURITY' ? 40 : 10)),
                readerStatus: {
                    total: zone._count.rfidReaders || 0,
                    online: zone.rfidReaders?.filter((r: any) => r.isOnline).length || 0,
                    offline: zone.rfidReaders?.filter((r: any) => !r.isOnline).length || 0
                }
            };
        });

        return NextResponse.json({ success: true, data: enrichedZones });
    } catch (error) {
        console.error('Error fetching zones:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch zones' }, { status: 500 });
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
