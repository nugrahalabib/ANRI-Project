// API Route: Document Stats
// Returns total counts for all classification types

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        // Get counts by classification
        const [total, secret, restricted, publicCount, withAlerts] = await Promise.all([
            prisma.document.count({ where: { isActive: true } }),
            prisma.document.count({ where: { isActive: true, classification: 'SECRET' } }),
            prisma.document.count({ where: { isActive: true, classification: 'RESTRICTED' } }),
            prisma.document.count({ where: { isActive: true, classification: 'PUBLIC' } }),
            prisma.document.count({
                where: {
                    isActive: true,
                    anomalies: { some: {} }
                }
            }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                total,
                secret,
                restricted,
                public: publicCount,
                withAlerts,
            },
        });
    } catch (error) {
        console.error('Document stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch document stats' },
            { status: 500 }
        );
    }
}
