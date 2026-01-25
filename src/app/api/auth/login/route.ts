'use server';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession, setSessionCookie } from '@/lib/auth/session';
import { getDefaultDashboard } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog } from '@/lib/crypto/auditHelper';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email dan password diperlukan' },
                { status: 400 }
            );
        }

        const user = await authenticateUser(email, password);

        if (!user) {
            return NextResponse.json(
                { error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Get client info for session tracking
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Create session
        const { token, expiresAt } = await createSession(user, ipAddress, userAgent);

        // Set session cookie
        await setSessionCookie(token, expiresAt);

        // Create audit log for login
        await createAuditLog({
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user.id,
            userId: user.id,
            details: JSON.stringify({ email: user.email, role: user.role }),
            ipAddress,
            userAgent,
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { updatedAt: new Date() },
        });

        // Get default dashboard for role
        const redirectUrl = getDefaultDashboard(user.role);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
            },
            redirectUrl,
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
