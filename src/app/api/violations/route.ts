// API Route: Violations - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const severity = searchParams.get('severity');
        const actionTaken = searchParams.get('action');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};

        if (severity && severity !== 'all') {
            where.severity = severity;
        }

        if (actionTaken && actionTaken !== 'all') {
            where.actionTaken = actionTaken;
        }

        const [violations, total] = await Promise.all([
            prisma.policyViolation.findMany({
                where,
                include: {
                    policy: { select: { id: true, name: true, category: true } },
                    user: { select: { id: true, name: true, email: true, department: true } },
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
            }),
            prisma.policyViolation.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: violations,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Error fetching violations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch violations' },
            { status: 500 }
        );
    }
}
