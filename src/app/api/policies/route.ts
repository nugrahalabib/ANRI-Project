// API Route: Policies CRUD - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const isActive = searchParams.get('active');
        const severity = searchParams.get('severity');

        const where: Record<string, unknown> = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (isActive !== null && isActive !== undefined && isActive !== 'all') {
            where.isActive = isActive === 'true';
        }

        if (severity && severity !== 'all') {
            where.severity = severity;
        }

        const [policies, total, violationCounts] = await Promise.all([
            prisma.policyRule.findMany({
                where,
                orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
            }),
            prisma.policyRule.count({ where }),
            prisma.policyViolation.groupBy({
                by: ['policyId'],
                _count: { id: true },
            }),
        ]);

        const violationMap = new Map(violationCounts.map(v => [v.policyId, v._count.id]));

        const enrichedPolicies = policies.map(policy => ({
            ...policy,
            violationCount: violationMap.get(policy.id) || 0,
        }));

        return NextResponse.json({
            success: true,
            data: enrichedPolicies,
            total,
        });
    } catch (error) {
        console.error('Error fetching policies:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch policies' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, category, pattern, action, severity, priority, isActive = true } = body;

        if (!name || !category || !pattern || !action) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const policy = await prisma.policyRule.create({
            data: { name, description, category, pattern, action, severity: severity || 'MEDIUM', priority: priority || 50, isActive },
        });

        return NextResponse.json({ success: true, data: policy }, { status: 201 });
    } catch (error) {
        console.error('Error creating policy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create policy' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Policy ID is required' },
                { status: 400 }
            );
        }

        const policy = await prisma.policyRule.update({
            where: { id },
            data: { ...updates, updatedAt: new Date() },
        });

        return NextResponse.json({ success: true, data: policy });
    } catch (error) {
        console.error('Error updating policy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update policy' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Policy ID is required' },
                { status: 400 }
            );
        }

        await prisma.policyRule.delete({ where: { id } });

        return NextResponse.json({ success: true, deletedId: id });
    } catch (error) {
        console.error('Error deleting policy:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete policy' },
            { status: 500 }
        );
    }
}
