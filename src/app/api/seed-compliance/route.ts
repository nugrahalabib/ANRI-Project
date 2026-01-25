// Seed ONLY new Compliance Tables - Does NOT delete existing data
// This is additive seeding for compliance-specific tables only

import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import * as crypto from 'crypto';

function randomDate(daysAgo: number): Date {
    const now = new Date();
    const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

function generateSignature(data: string): string {
    return crypto.createHmac('sha256', 'ANRI-AUDIT-KEY-2024').update(data).digest('hex');
}

export async function GET() {
    const startTime = Date.now();

    try {
        console.log('🚀 Seeding ONLY compliance tables (additive, no deletions)...');

        // 1. Create Regulations (upsert to avoid duplicates)
        const regulationsData = [
            { name: 'Undang-Undang Kearsipan', code: 'UU 43/2009', category: 'LAW' as const, issuingBody: 'DPR RI', ownerDepartment: 'Biro Hukum', status: 'COMPLIANT' as const },
            { name: 'Sistem Pemerintahan Berbasis Elektronik', code: 'Perpres 95/2018', category: 'PRESIDENTIAL' as const, issuingBody: 'Presiden RI', ownerDepartment: 'Unit IT', status: 'PARTIAL' as const },
            { name: 'Information Security Management', code: 'ISO 27001:2022', category: 'INTERNATIONAL' as const, issuingBody: 'ISO/IEC', ownerDepartment: 'Unit IT Security', status: 'COMPLIANT' as const },
            { name: 'Manajemen Risiko Instansi Pemerintah', code: 'PP 60/2008', category: 'GOVERNMENT' as const, issuingBody: 'Pemerintah RI', ownerDepartment: 'Unit Kepatuhan', status: 'COMPLIANT' as const },
            { name: 'Pengamanan Informasi Pemerintah', code: 'Permen 59/2020', category: 'GOVERNMENT' as const, issuingBody: 'Kementerian PANRB', ownerDepartment: 'Unit IT Security', status: 'UNDER_REVIEW' as const },
            { name: 'Keterbukaan Informasi Publik', code: 'UU 14/2008', category: 'LAW' as const, issuingBody: 'DPR RI', ownerDepartment: 'Humas', status: 'COMPLIANT' as const },
            { name: 'Perlindungan Data Pribadi', code: 'UU 27/2022', category: 'LAW' as const, issuingBody: 'DPR RI', ownerDepartment: 'Unit Kepatuhan', status: 'PARTIAL' as const },
            { name: 'Standar Nasional Arsip', code: 'Perka ANRI 28/2020', category: 'GOVERNMENT' as const, issuingBody: 'ANRI', ownerDepartment: 'Kearsipan', status: 'COMPLIANT' as const },
            { name: 'Records Management', code: 'ISO 15489-1:2016', category: 'INTERNATIONAL' as const, issuingBody: 'ISO', ownerDepartment: 'Kearsipan', status: 'COMPLIANT' as const },
            { name: 'SOP Keamanan Gedung', code: 'SOP-SEC-001', category: 'INTERNAL' as const, issuingBody: 'ANRI', ownerDepartment: 'Unit Keamanan', status: 'COMPLIANT' as const },
        ];

        let regulationsCount = 0;
        for (const regData of regulationsData) {
            await prisma.regulation.upsert({
                where: { code: regData.code },
                update: {},
                create: {
                    ...regData,
                    description: `Regulasi ${regData.name} yang diterbitkan oleh ${regData.issuingBody}`,
                    effectiveDate: randomDate(365 * 5),
                    lastReviewDate: randomDate(90),
                    nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    isActive: true,
                },
            });
            regulationsCount++;
        }

        // 2. Create Audit Schedules
        const auditSchedulesData = [
            { name: 'Audit Internal Q4 2024', type: 'INTERNAL' as const, auditorName: 'Tim Inspektorat', auditorOrg: 'Inspektorat ANRI', status: 'COMPLETED' as const, findings: 3, criticalFindings: 0 },
            { name: 'Surveillance Audit ISO 27001', type: 'SURVEILLANCE' as const, auditorName: 'PT. Sucofindo', auditorOrg: 'ISO Certification Body', status: 'COMPLETED' as const, findings: 2, criticalFindings: 0 },
            { name: 'Audit BPK Semester II', type: 'EXTERNAL' as const, auditorName: 'Tim Auditor BPK', auditorOrg: 'BPK RI', status: 'COMPLETED' as const, findings: 5, criticalFindings: 1 },
            { name: 'Review Kepatuhan SPBE', type: 'INTERNAL' as const, auditorName: 'Tim Evaluasi SPBE', auditorOrg: 'Kementerian PANRB', status: 'IN_PROGRESS' as const, findings: 0, criticalFindings: 0 },
            { name: 'Audit Sertifikasi ISO 27001', type: 'CERTIFICATION' as const, auditorName: 'BSI Indonesia', auditorOrg: 'ISO Certification Body', status: 'SCHEDULED' as const, findings: 0, criticalFindings: 0 },
        ];

        let auditsCount = 0;
        for (let i = 0; i < auditSchedulesData.length; i++) {
            const auditData = auditSchedulesData[i];
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() - (auditSchedulesData.length - i - 1) * 30);

            await prisma.auditSchedule.create({
                data: {
                    ...auditData,
                    description: `${auditData.name} oleh ${auditData.auditorOrg}`,
                    scheduledDate,
                    completedDate: auditData.status === 'COMPLETED' ? scheduledDate : null,
                },
            });
            auditsCount++;
        }

        // 3. Create Policy Acknowledgments (get existing users)
        const users = await prisma.user.findMany({ where: { isActive: true } });
        const mainPolicies = [
            { id: 'pol-001', name: 'Kebijakan Keamanan Informasi', version: 'v2.1' },
            { id: 'pol-002', name: 'Kebijakan Penggunaan Internet', version: 'v1.5' },
            { id: 'pol-003', name: 'Kebijakan Privasi Data', version: 'v3.0' },
            { id: 'pol-004', name: 'Kebijakan Anti-Korupsi', version: 'v1.2' },
            { id: 'pol-005', name: 'Kode Etik Pegawai', version: 'v2.0' },
        ];

        let acknowledgedCount = 0;
        for (const user of users) {
            for (const policy of mainPolicies) {
                if (Math.random() < 0.96) {
                    try {
                        await prisma.policyAcknowledgment.create({
                            data: {
                                userId: user.id,
                                policyId: policy.id,
                                policyName: policy.name,
                                policyVersion: policy.version,
                                acknowledgedAt: randomDate(90),
                                ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                                digitalSignature: generateSignature(`${user.id}:${policy.id}:${Date.now()}`),
                                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                                isValid: true,
                            },
                        });
                        acknowledgedCount++;
                    } catch {
                        // Skip if duplicate
                    }
                }
            }
        }

        // 4. Create Compliance Metrics
        const complianceCategories = [
            { category: 'POLICY_ACK', name: 'Policy Acknowledgment Rate', base: 94, target: 100, unit: '%' },
            { category: 'AUDIT_READY', name: 'Audit Readiness Score', base: 91, target: 95, unit: '%' },
            { category: 'REGULATION_COMPLIANCE', name: 'Regulation Compliance', base: 87, target: 100, unit: '%' },
            { category: 'TRAINING_COMPLETION', name: 'Training Completion Rate', base: 82, target: 90, unit: '%' },
            { category: 'INCIDENT_RESOLUTION', name: 'Incident Resolution Rate', base: 88, target: 95, unit: '%' },
            { category: 'DAYS_SINCE_AUDIT', name: 'Days Since Last Audit', base: 12, target: null, unit: 'days' },
        ];

        let metricsCount = 0;
        for (let month = 0; month < 6; month++) {
            const period = `2024-${String(month + 7).padStart(2, '0')}`;
            for (const cat of complianceCategories) {
                const improvement = month * 1.5;
                const value = cat.category === 'DAYS_SINCE_AUDIT'
                    ? 30 - month * 5
                    : Math.min(cat.base + improvement + (Math.random() - 0.5) * 3, 99);

                await prisma.complianceMetric.create({
                    data: {
                        name: cat.name,
                        category: cat.category,
                        value,
                        target: cat.target,
                        unit: cat.unit,
                        trend: month > 2 ? 'UP' : 'STABLE',
                        period,
                        calculatedAt: new Date(2024, month + 6, 28),
                    },
                });
                metricsCount++;
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        return NextResponse.json({
            success: true,
            message: '✅ Compliance data seeded (NO existing data deleted)',
            summary: {
                regulations: regulationsCount,
                auditSchedules: auditsCount,
                policyAcknowledgments: acknowledgedCount,
                complianceMetrics: metricsCount,
            },
            duration: `${duration}s`,
        });
    } catch (error) {
        console.error('❌ Compliance seed error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
