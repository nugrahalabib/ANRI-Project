// API Route: Risk Posture - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const riskPostures = await prisma.riskPosture.findMany({
            where: { calculatedAt: { gte: startDate } },
            orderBy: { calculatedAt: 'desc' },
        });

        const latest = riskPostures[0] || null;

        // Calculate trends
        const oldest = riskPostures[riskPostures.length - 1];
        const trends = latest && oldest ? {
            overall: latest.overallScore < oldest.overallScore ? 'improving' : 'worsening',
            document: latest.documentRisk < oldest.documentRisk ? 'improving' : 'worsening',
            digital: latest.digitalRisk < oldest.digitalRisk ? 'improving' : 'worsening',
            compliance: latest.complianceRisk < oldest.complianceRisk ? 'improving' : 'worsening',
        } : null;

        return NextResponse.json({
            success: true,
            data: {
                latest,
                history: riskPostures,
                trends,
            },
        });
    } catch (error) {
        console.error('Error fetching risk posture:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch risk posture' },
            { status: 500 }
        );
    }
}
