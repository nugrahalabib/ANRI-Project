// API Route: RFID Readers
// Provides RFID reader listing with zone information

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const readers = await prisma.rFIDReader.findMany({
            include: {
                zone: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        securityLevel: true,
                    },
                },
            },
            orderBy: [
                { isOnline: 'desc' },
                { name: 'asc' },
            ],
        });

        return NextResponse.json({
            success: true,
            data: readers,
            total: readers.length,
        });
    } catch (error) {
        console.error('RFID Readers fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch RFID readers' },
            { status: 500 }
        );
    }
}
