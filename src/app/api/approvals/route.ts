'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/crypto/auditHelper';

// Create approval request for document movement
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { documentId, targetZoneId, justification, priority = 'NORMAL' } = body;

        if (!documentId || !targetZoneId || !justification) {
            return NextResponse.json(
                { success: false, error: 'Field documentId, targetZoneId, dan justification wajib diisi' },
                { status: 400 }
            );
        }

        // Get document and zones
        const [document, targetZone] = await Promise.all([
            prisma.document.findUnique({
                where: { id: documentId },
                include: { currentZone: true },
            }),
            prisma.zone.findUnique({ where: { id: targetZoneId } }),
        ]);

        if (!document) {
            return NextResponse.json(
                { success: false, error: 'Dokumen tidak ditemukan' },
                { status: 404 }
            );
        }

        if (!targetZone) {
            return NextResponse.json(
                { success: false, error: 'Zona tujuan tidak ditemukan' },
                { status: 404 }
            );
        }

        // Generate request ID
        const year = new Date().getFullYear();
        const count = await prisma.approvalRequest.count({
            where: {
                createdAt: {
                    gte: new Date(year, 0, 1),
                },
            },
        });
        const requestNumber = `APR-${year}-${String(count + 1).padStart(4, '0')}`;

        // Create approval request
        const approval = await prisma.approvalRequest.create({
            data: {
                requestNumber,
                type: 'DOCUMENT_MOVEMENT',
                requesterId: user.id,
                subject: `Permintaan pemindahan dokumen: ${document.title}`,
                description: justification,
                priority,
                status: 'PENDING',
                metadata: JSON.stringify({
                    documentId: document.id,
                    documentTitle: document.title,
                    rfidTag: document.rfidTag,
                    classification: document.classification,
                    fromZoneId: document.currentZoneId,
                    fromZoneName: document.currentZone?.name,
                    toZoneId: targetZone.id,
                    toZoneName: targetZone.name,
                }),
            },
        });

        // Create audit log
        await createAuditLog({
            action: 'CREATE_APPROVAL_REQUEST',
            entityType: 'ApprovalRequest',
            entityId: approval.id,
            userId: user.id,
            details: JSON.stringify({
                requestNumber,
                documentId: document.id,
                fromZone: document.currentZone?.name,
                toZone: targetZone.name,
            }),
        });

        // Create notification for approvers (find IT_SECURITY or EXECUTIVE users)
        const approvers = await prisma.user.findMany({
            where: {
                OR: [{ role: 'IT_SECURITY' }, { role: 'EXECUTIVE' }],
                isActive: true,
            },
            take: 3,
        });

        for (const approver of approvers) {
            await prisma.notification.create({
                data: {
                    userId: approver.id,
                    type: 'WARNING',
                    title: 'Permintaan Persetujuan Baru',
                    message: `${user.name} memohon persetujuan untuk memindahkan dokumen "${document.title}" ke ${targetZone.name}`,
                    severity: priority === 'URGENT' ? 'HIGH' : 'MEDIUM',
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: approval.id,
                requestNumber,
                status: approval.status,
            },
            message: `Permintaan ${requestNumber} berhasil dibuat`,
        });
    } catch (error) {
        console.error('Create approval request error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal membuat permintaan' },
            { status: 500 }
        );
    }
}

// Get approval requests
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: Record<string, unknown> = {};
        if (status && status !== 'all') where.status = status;
        if (type && type !== 'all') where.type = type;

        const [approvals, total] = await Promise.all([
            prisma.approvalRequest.findMany({
                where,
                include: {
                    requester: {
                        select: { id: true, name: true, department: true },
                    },
                    approvedBy: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.approvalRequest.count({ where }),
        ]);

        // Parse metadata for each approval
        const enrichedApprovals = approvals.map(a => ({
            ...a,
            metadata: a.metadata ? JSON.parse(a.metadata) : null,
        }));

        return NextResponse.json({
            success: true,
            data: enrichedApprovals,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get approvals error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal mengambil data' },
            { status: 500 }
        );
    }
}

// Update approval status (approve/reject)
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        // Only IT_SECURITY and EXECUTIVE can approve
        if (!['IT_SECURITY', 'EXECUTIVE', 'SYSTEM_ADMIN'].includes(user.role)) {
            return NextResponse.json(
                { success: false, error: 'Tidak memiliki izin untuk menyetujui' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, action, notes } = body;

        if (!id || !action) {
            return NextResponse.json(
                { success: false, error: 'ID dan action wajib diisi' },
                { status: 400 }
            );
        }

        const validActions = ['APPROVED', 'REJECTED'];
        if (!validActions.includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Action tidak valid' },
                { status: 400 }
            );
        }

        const approval = await prisma.approvalRequest.update({
            where: { id },
            data: {
                status: action,
                approvedById: user.id,
                approvedAt: new Date(),
                notes,
            },
            include: {
                requester: { select: { id: true, name: true } },
            },
        });

        // If approved and it's a document movement, update the document zone
        if (action === 'APPROVED' && approval.type === 'DOCUMENT_MOVEMENT') {
            const metadata = approval.metadata ? JSON.parse(approval.metadata) : {};
            if (metadata.documentId && metadata.toZoneId) {
                await prisma.document.update({
                    where: { id: metadata.documentId },
                    data: { currentZoneId: metadata.toZoneId },
                });

                // Create movement record - get first reader in target zone
                const reader = await prisma.rFIDReader.findFirst({
                    where: { zoneId: metadata.toZoneId },
                });

                if (reader) {
                    await prisma.documentMovement.create({
                        data: {
                            documentId: metadata.documentId,
                            fromZoneId: metadata.fromZoneId,
                            toZoneId: metadata.toZoneId,
                            readerId: reader.id,
                            isAuthorized: true,
                            riskScore: 0.1,
                        },
                    });
                }
            }
        }

        // Notify requester
        await prisma.notification.create({
            data: {
                userId: approval.requesterId,
                type: 'INFORMATION',
                title: action === 'APPROVED' ? 'Permintaan Disetujui' : 'Permintaan Ditolak',
                message: `Permintaan ${approval.requestNumber} telah ${action === 'APPROVED' ? 'disetujui' : 'ditolak'} oleh ${user.name}`,
                severity: 'MEDIUM',
            },
        });

        // Audit log
        await createAuditLog({
            action: action === 'APPROVED' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
            entityType: 'ApprovalRequest',
            entityId: approval.id,
            userId: user.id,
            details: JSON.stringify({ requestNumber: approval.requestNumber, notes }),
        });

        return NextResponse.json({
            success: true,
            data: approval,
            message: `Permintaan berhasil ${action === 'APPROVED' ? 'disetujui' : 'ditolak'}`,
        });
    } catch (error) {
        console.error('Update approval error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal memperbarui permintaan' },
            { status: 500 }
        );
    }
}
