// API Route: Users - Connected to Database
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

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

// POST: Create new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, role, department, password } = body;

        // Basic validation
        if (!email || !name || !role || !password) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check duplicate
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash,
                role,
                department,
                isActive: true
            }
        });

        // Don't return password hash
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _ph, ...userWithoutPassword } = newUser;

        return NextResponse.json({ success: true, data: userWithoutPassword });

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        );
    }
}

// PATCH: Update user
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, role, department, isActive, password } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            );
        }

        const data: Record<string, unknown> = {};
        if (name) data.name = name;
        if (role) data.role = role;
        if (department) data.department = department;
        if (typeof isActive === 'boolean') data.isActive = isActive;

        if (password) {
            data.passwordHash = await bcrypt.hash(password, 12);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });

        const { passwordHash: _ph, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({ success: true, data: userWithoutPassword });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

// DELETE: Soft delete (deactivate) or hard delete if requested
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const type = searchParams.get('type'); // 'soft' or 'hard'

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            );
        }

        if (type === 'hard') {
            await prisma.user.delete({ where: { id } });
        } else {
            // Default to soft delete (deactivate)
            await prisma.user.update({
                where: { id },
                data: { isActive: false }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
