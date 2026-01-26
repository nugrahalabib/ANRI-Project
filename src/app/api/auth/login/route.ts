'use server';

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, createSession, setSessionCookie } from '@/lib/auth/session';
import { getDefaultDashboard } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db/prisma';
import { createAuditLog } from '@/lib/crypto/auditHelper';

export async function POST(request: NextRequest) {
    console.log('[LOGIN] Starting login process...');

    try {
        // Step 1: Parse request body
        let email: string;
        let password: string;

        try {
            const body = await request.json();
            email = body.email;
            password = body.password;
            console.log('[LOGIN] Request parsed successfully for:', email);
        } catch (error) {
            console.error('[LOGIN] Failed to parse request body:', error);
            return NextResponse.json(
                { error: 'Invalid request format' },
                { status: 400 }
            );
        }

        if (!email || !password) {
            console.warn('[LOGIN] Missing email or password');
            return NextResponse.json(
                { error: 'Email dan password diperlukan' },
                { status: 400 }
            );
        }

        // Step 2: Authenticate user
        let user;
        try {
            console.log('[LOGIN] Authenticating user:', email);
            user = await authenticateUser(email, password);

            if (!user) {
                console.warn('[LOGIN] Authentication failed for:', email);
                return NextResponse.json(
                    { error: 'Email atau password salah' },
                    { status: 401 }
                );
            }
            console.log('[LOGIN] User authenticated successfully:', user.id, user.email);
        } catch (error) {
            console.error('[LOGIN] Error during authentication:', error);
            return NextResponse.json(
                { error: 'Authentication error: ' + (error instanceof Error ? error.message : 'Unknown error') },
                { status: 500 }
            );
        }

        // Get client info for session tracking
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Step 3: Create session
        let token: string;
        let expiresAt: Date;
        try {
            console.log('[LOGIN] Creating session for user:', user.id);
            const sessionData = await createSession(user, ipAddress, userAgent);
            token = sessionData.token;
            expiresAt = sessionData.expiresAt;
            console.log('[LOGIN] Session created successfully');
        } catch (error) {
            console.error('[LOGIN] Error creating session:', error);
            return NextResponse.json(
                { error: 'Session creation error: ' + (error instanceof Error ? error.message : 'Unknown error') },
                { status: 500 }
            );
        }

        // Step 4: Set session cookie
        try {
            console.log('[LOGIN] Setting session cookie');
            await setSessionCookie(token, expiresAt);
            console.log('[LOGIN] Cookie set successfully');
        } catch (error) {
            console.error('[LOGIN] Error setting cookie:', error);
            // Non-fatal, continue
            console.warn('[LOGIN] Continuing despite cookie error');
        }

        // Step 5: Create audit log (non-blocking)
        try {
            console.log('[LOGIN] Creating audit log');
            await createAuditLog({
                action: 'USER_LOGIN',
                entityType: 'User',
                entityId: user.id,
                userId: user.id,
                details: JSON.stringify({ email: user.email, role: user.role }),
                ipAddress,
                userAgent,
            });
            console.log('[LOGIN] Audit log created successfully');
        } catch (error) {
            console.error('[LOGIN] Error creating audit log (non-fatal):', error);
            // Don't fail the login if audit log fails
        }

        // Step 6: Update last login
        try {
            console.log('[LOGIN] Updating last login timestamp');
            await prisma.user.update({
                where: { id: user.id },
                data: { updatedAt: new Date() },
            });
        } catch (error) {
            console.error('[LOGIN] Error updating last login (non-fatal):', error);
            // Non-fatal, continue
        }

        // Step 7: Get default dashboard for role
        const redirectUrl = getDefaultDashboard(user.role);
        console.log('[LOGIN] Login successful! Redirect to:', redirectUrl);

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
        console.error('[LOGIN] Unexpected error in login route:', error);
        console.error('[LOGIN] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: 'Terjadi kesalahan server: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}
