// API Route: KPI Metrics - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const period = searchParams.get('period');

        const where: Record<string, unknown> = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (period) {
            where.period = period;
        }

        const kpis = await prisma.kPIMetric.findMany({
            where,
            orderBy: [{ period: 'desc' }, { category: 'asc' }],
        });

        // Calculate latest KPIs by category
        const latestByCategory: Record<string, typeof kpis[0]> = {};
        for (const kpi of kpis) {
            if (!latestByCategory[kpi.category] || kpi.period > latestByCategory[kpi.category].period) {
                latestByCategory[kpi.category] = kpi;
            }
        }

        return NextResponse.json({
            success: true,
            data: kpis,
            latest: latestByCategory,
            total: kpis.length,
        });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch KPIs' },
            { status: 500 }
        );
    }
}
