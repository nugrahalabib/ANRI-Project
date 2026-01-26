'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { createAuditLog } from '@/lib/crypto/auditHelper';

// Determine required approval level based on classification
function getRequiredApprovalLevel(classification: string): { level: number; roles: string[] } {
    switch (classification) {
        case 'SECRET':
            return { level: 3, roles: ['COMPLIANCE_OFFICER', 'IT_SECURITY', 'EXECUTIVE'] };
        case 'RESTRICTED':
            return { level: 2, roles: ['COMPLIANCE_OFFICER', 'IT_SECURITY'] };
        case 'PUBLIC':
        default:
            return { level: 1, roles: ['COMPLIANCE_OFFICER'] };
    }
}

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

        // Determine required approval level based on classification
        const { level: requiredLevel, roles } = getRequiredApprovalLevel(document.classification);

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

        // Create approval request with multi-level support
        const approval = await prisma.approvalRequest.create({
            data: {
                requestNumber,
                type: 'DOCUMENT_MOVEMENT',
                requesterId: user.id,
                subject: `Permintaan pemindahan dokumen: ${document.title}`,
                description: justification,
                priority,
                status: 'PENDING',
                currentLevel: 1,
                requiredLevel,
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

        // Create approval steps for each level
        for (let i = 0; i < requiredLevel; i++) {
            await prisma.approvalStep.create({
                data: {
                    requestId: approval.id,
                    level: i + 1,
                    roleRequired: roles[i] || null,
                    status: i === 0 ? 'PENDING' : 'PENDING', // First step is active
                },
            });
        }

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
                requiredLevel,
            }),
        });

        // Create notification for approvers (find users with required role)
        const approvers = await prisma.user.findMany({
            where: {
                role: { in: ['IT_SECURITY', 'EXECUTIVE', 'COMPLIANCE_OFFICER'] },
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
                    message: `${user.name} memohon persetujuan untuk memindahkan dokumen "${document.title}" ke ${targetZone.name} (Level ${requiredLevel})`,
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
                requiredLevel,
                currentLevel: 1,
            },
            message: `Permintaan ${requestNumber} berhasil dibuat (memerlukan ${requiredLevel} level persetujuan)`,
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
                orderBy: { createdAt: 'desc' },
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
            { success: false, error: 'Gagal mengambil data', details: String(error) },
            { status: 500 }
        );
    }
}

// Update approval status (approve/reject) - with multi-level support
export async function PATCH(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Tidak terautentikasi' },
                { status: 401 }
            );
        }

        // Only IT_SECURITY, EXECUTIVE, COMPLIANCE_OFFICER can approve
        if (!['IT_SECURITY', 'EXECUTIVE', 'SYSTEM_ADMIN', 'COMPLIANCE_OFFICER'].includes(user.role)) {
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

        // Get current approval request with steps
        const approval = await prisma.approvalRequest.findUnique({
            where: { id },
            include: {
                steps: { orderBy: { level: 'asc' } },
                requester: { select: { id: true, name: true } },
            },
        });

        if (!approval) {
            return NextResponse.json(
                { success: false, error: 'Permintaan tidak ditemukan' },
                { status: 404 }
            );
        }

        if (approval.status !== 'PENDING') {
            return NextResponse.json(
                { success: false, error: 'Permintaan sudah diproses' },
                { status: 400 }
            );
        }

        // Find current step
        const currentStep = approval.steps.find(s => s.level === approval.currentLevel && s.status === 'PENDING');

        if (!currentStep) {
            return NextResponse.json(
                { success: false, error: 'Tidak ada step yang menunggu persetujuan' },
                { status: 400 }
            );
        }

        // Update current step
        await prisma.approvalStep.update({
            where: { id: currentStep.id },
            data: {
                status: action,
                approverId: user.id,
                notes,
                decidedAt: new Date(),
            },
        });

        let finalStatus = 'PENDING';
        let shouldMoveDocument = false;

        if (action === 'REJECTED') {
            // If rejected at any level, the whole request is rejected
            finalStatus = 'REJECTED';
        } else if (action === 'APPROVED') {
            if (approval.currentLevel >= approval.requiredLevel) {
                // Final approval - all levels completed
                finalStatus = 'APPROVED';
                shouldMoveDocument = true;
            } else {
                // Move to next level
                await prisma.approvalRequest.update({
                    where: { id },
                    data: {
                        currentLevel: approval.currentLevel + 1,
                    },
                });
                finalStatus = 'PENDING'; // Still pending next level
            }
        }

        // Update approval request if final decision
        if (finalStatus !== 'PENDING') {
            await prisma.approvalRequest.update({
                where: { id },
                data: {
                    status: finalStatus as 'APPROVED' | 'REJECTED',
                    approvedById: user.id,
                    approvedAt: new Date(),
                    notes,
                },
            });
        }

        // If approved and it's a document movement, update the document zone
        if (shouldMoveDocument && approval.type === 'DOCUMENT_MOVEMENT') {
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
        const statusMsg = finalStatus === 'APPROVED'
            ? 'disetujui (semua level)'
            : finalStatus === 'REJECTED'
                ? 'ditolak'
                : `disetujui level ${approval.currentLevel}, menunggu level ${approval.currentLevel + 1}`;

        await prisma.notification.create({
            data: {
                userId: approval.requesterId,
                type: 'INFORMATION',
                title: finalStatus === 'APPROVED' ? 'Permintaan Disetujui' :
                    finalStatus === 'REJECTED' ? 'Permintaan Ditolak' : 'Persetujuan Level Berikutnya',
                message: `Permintaan ${approval.requestNumber} telah ${statusMsg} oleh ${user.name}`,
                severity: 'MEDIUM',
            },
        });

        // Audit log
        await createAuditLog({
            action: action === 'APPROVED' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
            entityType: 'ApprovalRequest',
            entityId: approval.id,
            userId: user.id,
            details: JSON.stringify({
                requestNumber: approval.requestNumber,
                notes,
                level: approval.currentLevel,
                finalStatus,
            }),
        });

        return NextResponse.json({
            success: true,
            data: {
                id: approval.id,
                requestNumber: approval.requestNumber,
                currentLevel: finalStatus === 'PENDING' ? approval.currentLevel + 1 : approval.currentLevel,
                requiredLevel: approval.requiredLevel,
                status: finalStatus,
            },
            message: finalStatus === 'APPROVED'
                ? 'Permintaan disetujui (dokumen dipindahkan)'
                : finalStatus === 'REJECTED'
                    ? 'Permintaan ditolak'
                    : `Level ${approval.currentLevel} disetujui, menunggu level ${approval.currentLevel + 1}`,
        });
    } catch (error) {
        console.error('Update approval error:', error);
        return NextResponse.json(
            { success: false, error: 'Gagal memperbarui permintaan' },
            { status: 500 }
        );
    }
}
