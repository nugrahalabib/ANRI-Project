'use server';

import { NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/crypto/auditHelper';

export async function POST() {
    try {
        const session = await getSession();

        if (session) {
            // Create audit log for logout
            await createAuditLog({
                action: 'USER_LOGOUT',
                entityType: 'User',
                entityId: session.userId,
                userId: session.userId,
                details: JSON.stringify({ email: session.email }),
            });
        }

        await destroySession();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
