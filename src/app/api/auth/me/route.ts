'use server';

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getPermissions, getDefaultDashboard } from '@/lib/auth/rbac';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        const permissions = getPermissions(user.role);
        const defaultDashboard = getDefaultDashboard(user.role);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                department: user.department,
            },
            permissions,
            defaultDashboard,
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
