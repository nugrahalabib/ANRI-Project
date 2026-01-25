// API Route: Hourly Activity Analytics
// Returns document movement counts aggregated by hour for the last 24 hours

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Get all movements from the last 24 hours
        const movements = await prisma.documentMovement.findMany({
            where: {
                timestamp: {
                    gte: twentyFourHoursAgo,
                },
            },
            select: {
                id: true,
                timestamp: true,
                isAuthorized: true,
            },
            orderBy: {
                timestamp: 'asc',
            },
        });

        // Aggregate by hour
        const hourlyData: { hour: number; count: number; anomalyCount: number }[] = [];

        for (let i = 0; i < 24; i++) {
            const hourStart = new Date(now);
            hourStart.setHours(now.getHours() - 23 + i, 0, 0, 0);
            const hourEnd = new Date(hourStart);
            hourEnd.setHours(hourStart.getHours() + 1);

            const hourMovements = movements.filter(m => {
                const ts = new Date(m.timestamp);
                return ts >= hourStart && ts < hourEnd;
            });

            hourlyData.push({
                hour: hourStart.getHours(),
                count: hourMovements.length,
                anomalyCount: hourMovements.filter(m => !m.isAuthorized).length,
            });
        }

        // Get total stats
        const totalMovements = movements.length;
        const totalAnomalies = movements.filter(m => !m.isAuthorized).length;
        const anomalyRate = totalMovements > 0 ? (totalAnomalies / totalMovements * 100).toFixed(1) : '0';

        return NextResponse.json({
            success: true,
            data: {
                hourlyData,
                summary: {
                    totalMovements,
                    totalAnomalies,
                    anomalyRate: parseFloat(anomalyRate),
                    peakHour: hourlyData.reduce((max, curr) => curr.count > max.count ? curr : max, hourlyData[0])?.hour ?? 0,
                },
            },
        });
    } catch (error) {
        console.error('Activity analytics error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch activity analytics' },
            { status: 500 }
        );
    }
}
