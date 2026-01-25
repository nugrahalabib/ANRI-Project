// API Route: Users - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role');
        const department = searchParams.get('department');
        const search = searchParams.get('search');

        const where: Record<string, unknown> = { isActive: true };

        if (role && role !== 'all') {
            where.role = role;
        }

        if (department && department !== 'all') {
            where.department = department;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { violations: true, auditLogs: true } },
            },
            orderBy: { name: 'asc' },
        });

        const enrichedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department || 'General',
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.updatedAt, // Use updatedAt as proxy for lastLogin
            violationCount: user._count.violations,
            activityCount: user._count.auditLogs,
        }));

        return NextResponse.json({
            success: true,
            data: enrichedUsers,
            total: enrichedUsers.length,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
