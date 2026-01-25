// API Route: Audit Trail
// Provides cryptographically-signed audit log entries

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { signAuditLog, hashAuditLog } from '@/lib/crypto/auditSigning';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const entityType = searchParams.get('entityType');
        const userId = searchParams.get('userId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        // Build filter conditions
        const where: any = {};

        if (action) where.action = action;
        if (entityType) where.entityType = entityType;
        if (userId) where.userId = userId;

        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) where.timestamp.gte = new Date(startDate);
            if (endDate) where.timestamp.lte = new Date(endDate);
        }

        // Fetch logs with user info
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, role: true },
                    },
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);

        // Parse JSON fields
        const enrichedLogs = logs.map(log => ({
            ...log,
            previousValue: log.previousValue ? JSON.parse(log.previousValue) : null,
            newValue: log.newValue ? JSON.parse(log.newValue) : null,
            metadata: log.metadata ? JSON.parse(log.metadata) : null,
        }));

        return NextResponse.json({
            success: true,
            data: enrichedLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Audit log fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch audit logs' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, entityType, entityId, userId, previousValue, newValue, metadata, ipAddress, userAgent } = body;

        if (!action || !entityType || !entityId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the previous log entry for chain linking
        const previousLog = await prisma.auditLog.findFirst({
            orderBy: { timestamp: 'desc' },
            select: { signature: true, timestamp: true },
        });

        const previousHash = previousLog
            ? hashAuditLog({
                ...body,
                signature: previousLog.signature,
                previousHash: null,
                timestamp: previousLog.timestamp,
            })
            : null;

        // Sign the new log entry
        const signedLog = signAuditLog({
            action,
            entityType,
            entityId,
            userId,
            previousValue,
            newValue,
            metadata,
            ipAddress,
            userAgent,
        }, previousHash);

        // Create the log entry
        const auditLog = await prisma.auditLog.create({
            data: {
                action,
                entityType,
                entityId,
                userId,
                previousValue: previousValue ? JSON.stringify(previousValue) : null,
                newValue: newValue ? JSON.stringify(newValue) : null,
                metadata: metadata ? JSON.stringify(metadata) : null,
                ipAddress,
                userAgent,
                signature: signedLog.signature,
                previousHash: signedLog.previousHash,
            },
        });

        return NextResponse.json({
            success: true,
            data: auditLog,
        }, { status: 201 });
    } catch (error) {
        console.error('Audit log create error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create audit log' },
            { status: 500 }
        );
    }
}
