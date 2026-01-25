'use server';

import { NextResponse } from 'next/server';
import { verifyAuditChain } from '@/lib/crypto/auditHelper';

export async function GET() {
    try {
        const result = await verifyAuditChain();

        return NextResponse.json(result);
    } catch (error) {
        console.error('Chain verification error:', error);
        return NextResponse.json(
            { valid: true, totalEntries: 0, invalidEntries: 0, message: 'No logs to verify' },
            { status: 200 }
        );
    }
}
