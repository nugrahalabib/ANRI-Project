// Health Check API for monitoring
// Used by Docker and load balancers to verify service health

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
    try {
        // Check database connectivity
        const dbCheck = await prisma.$queryRaw`SELECT 1 as result`;

        // Basic health response
        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '0.1.0',
            checks: {
                database: 'ok',
                memory: getMemoryUsage(),
                uptime: process.uptime(),
            },
        });
    } catch (error) {
        // Unhealthy response
        console.error('Health check failed:', error);
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
        }, { status: 503 });
    }
}

function getMemoryUsage() {
    const used = process.memoryUsage();
    return {
        heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(used.rss / 1024 / 1024) + ' MB',
    };
}
