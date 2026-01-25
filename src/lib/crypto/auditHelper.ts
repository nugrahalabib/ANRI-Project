// Audit Log Helper - Wrapper for creating audit logs with database persistence
// Combines crypto signing with Prisma persistence

import { prisma } from '@/lib/db/prisma';
import { signAuditLog, hashAuditLog, AuditLogData } from './auditSigning';

/**
 * Create an audit log entry with cryptographic signature and chain linking
 */
export async function createAuditLog(data: AuditLogData & { details?: string }): Promise<string> {
    // Get the previous log entry for chain linking
    const previousLog = await prisma.auditLog.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { signature: true, timestamp: true },
    });

    // Calculate previous hash for chain linking
    let previousHash: string | null = null;
    if (previousLog) {
        previousHash = hashAuditLog({
            ...data,
            signature: previousLog.signature,
            previousHash: null,
            timestamp: previousLog.timestamp,
        });
    }

    // Sign the audit log entry
    const signedLog = signAuditLog(data, previousHash);

    // Create the audit log in database
    const auditLog = await prisma.auditLog.create({
        data: {
            action: signedLog.action,
            entityType: signedLog.entityType,
            entityId: signedLog.entityId,
            userId: signedLog.userId || null,
            previousValue: data.previousValue ? JSON.stringify(data.previousValue) : null,
            newValue: data.newValue ? JSON.stringify(data.newValue) : null,
            metadata: data.details || (data.metadata ? JSON.stringify(data.metadata) : null),
            ipAddress: signedLog.ipAddress || null,
            userAgent: signedLog.userAgent || null,
            signature: signedLog.signature,
            previousHash: signedLog.previousHash,
            timestamp: signedLog.timestamp,
        },
    });

    return auditLog.id;
}

/**
 * Verify the integrity of the entire audit chain
 */
export async function verifyAuditChain(): Promise<{
    valid: boolean;
    totalEntries: number;
    invalidEntries: number;
    message: string;
}> {
    const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'asc' },
        select: {
            id: true,
            action: true,
            entityType: true,
            entityId: true,
            signature: true,
            previousHash: true,
            timestamp: true,
        },
    });

    let invalidCount = 0;
    let previousSignature: string | null = null;

    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];

        // First entry should have no previous hash
        if (i === 0) {
            if (log.previousHash !== null) {
                invalidCount++;
            }
        } else {
            // Verify chain linkage
            const expectedPrevHash = hashAuditLog({
                action: logs[i - 1].action,
                entityType: logs[i - 1].entityType,
                entityId: logs[i - 1].entityId,
                signature: previousSignature!,
                previousHash: null,
                timestamp: logs[i - 1].timestamp,
            });

            if (log.previousHash !== expectedPrevHash) {
                invalidCount++;
            }
        }

        previousSignature = log.signature;
    }

    const valid = invalidCount === 0;

    return {
        valid,
        totalEntries: logs.length,
        invalidEntries: invalidCount,
        message: valid
            ? `✓ Integritas rantai terverifikasi. ${logs.length} entri valid.`
            : `⚠ Ditemukan ${invalidCount} entri tidak valid dari ${logs.length} total entri.`,
    };
}
