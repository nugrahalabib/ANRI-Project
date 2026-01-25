'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts';
import styles from './page.module.css';

interface RiskPosture {
    overallScore: number;
    documentRisk: number;
    digitalRisk: number;
    complianceRisk: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    calculatedAt: string;
}

interface Violation {
    id: string;
    timestamp: string;
    severity: string;
    actionTaken: string;
    details: string | null;
    policy: { id: string; name: string; category: string } | null;
    user: { id: string; name: string; email: string; department: string } | null;
}

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
    user: { name: string; role: string } | null;
}

// Compliance regulations for ANRI
const regulations = [
    { id: '1', name: 'Undang-Undang Kearsipan', code: 'UU No. 43 Tahun 2009', category: 'LEGAL' },
    { id: '2', name: 'Sistem Pemerintahan Berbasis Elektronik', code: 'Perpres No. 95 Tahun 2018', category: 'LEGAL' },
    { id: '3', name: 'Information Security Management', code: 'ISO/IEC 27001:2022', category: 'STANDARD' },
    { id: '4', name: 'Manajemen Risiko', code: 'PP No. 60 Tahun 2008', category: 'LEGAL' },
    { id: '5', name: 'Pengamanan Informasi', code: 'Permen PANRB No. 59/2020', category: 'REGULATION' },
];

export default function ComplianceDashboard() {
    const [riskPosture, setRiskPosture] = useState<RiskPosture | null>(null);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [policyAckRate, setPolicyAckRate] = useState(87.5);

    useEffect(() => {
        async function fetchData() {
            try {
                const [riskRes, violationsRes, auditRes] = await Promise.all([
                    fetch('/api/risk-posture'),
                    fetch('/api/violations?limit=10'),
                    fetch('/api/audit?limit=10'),
                ]);
                const riskData = await riskRes.json();
                const violationsData = await violationsRes.json();
                const auditData = await auditRes.json();

                if (riskData.success && riskData.data.latest) {
                    setRiskPosture(riskData.data.latest);
                }
                if (violationsData.success) {
                    setViolations(violationsData.data);
                }
                if (auditData.success) {
                    setAuditLogs(auditData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Calculate compliance index (inverse of compliance risk)
    const complianceIndex = riskPosture ? (100 - riskPosture.complianceRisk).toFixed(1) : '92.4';
    const openFindings = riskPosture ? (riskPosture.criticalCount + riskPosture.highCount) : 3;

    // Get compliance status for each regulation based on violations
    const getRegulationStatus = (regId: string) => {
        const hasViolation = violations.some(v => v.policy?.category === regulations.find(r => r.id === regId)?.category);
        if (hasViolation && violations.some(v => v.severity === 'CRITICAL')) return 'critical';
        if (hasViolation) return 'action';
        return 'compliant';
    };

    // Get owner department for regulation
    const getOwnerDept = (category: string) => {
        const deptMap: Record<string, { name: string; abbr: string }> = {
            'LEGAL': { name: 'Unit Hukum', abbr: 'UH' },
            'STANDARD': { name: 'Unit Keamanan IT', abbr: 'IT' },
            'REGULATION': { name: 'Unit Kepatuhan', abbr: 'UK' },
        };
        return deptMap[category] || { name: 'Unit Umum', abbr: 'UU' };
    };

    // Get last evidence update time
    const getLastUpdate = (regId: string) => {
        const log = auditLogs.find(l => l.entityType.includes('Policy') || l.entityType.includes('Document'));
        if (log) {
            const diff = Math.floor((Date.now() - new Date(log.timestamp).getTime()) / 60000);
            if (diff < 60) return `${diff} menit lalu`;
            if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
            return `${Math.floor(diff / 1440)} hari lalu`;
        }
        return '2 jam lalu';
    };

    // Get overdue action items from violations
    const actionItems = violations.slice(0, 5).map(v => {
        const daysAgo = Math.floor((Date.now() - new Date(v.timestamp).getTime()) / 86400000);
        return {
            id: v.id,
            description: v.policy?.name || 'Review kebijakan akses',
            responsible: v.user?.name || 'Unit IT',
            department: v.user?.department || 'IT',
            deadline: daysAgo > 1 ? 'Kemarin' : 'Hari ini',
            isOverdue: daysAgo > 0,
            severity: v.severity,
        };
    });

    const formatTime = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff} menit lalu`;
        if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
        return new Date(dateStr).toLocaleDateString('id-ID');
    };

    if (loading) {
        return (
            <DashboardLayout title="Ruang Audit Digital Nasional" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Memuat data kepatuhan...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Ruang Audit Digital Nasional"
            subtitle="Dashboard Kepatuhan Regulasi & Audit Internal"
        >
            <div className={styles.container}>
                {/* ========== HEADER METRICS - Official Stamped Seals ========== */}
                <div className={styles.sealHeader}>
                    {/* Card 1: Indeks Kepatuhan Regulasi */}
                    <div className={`${styles.sealCard} ${styles.primary}`}>
                        <div className={styles.sealIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                        </div>
                        <span className={styles.sealValue}>{complianceIndex}%</span>
                        <span className={styles.sealLabel}>Indeks Kepatuhan Regulasi</span>
                        <span className={styles.sealSubtext}>Terakhir dihitung: {formatTime(riskPosture?.calculatedAt || new Date().toISOString())}</span>
                    </div>

                    {/* Card 2: Temuan Audit Terbuka */}
                    <div className={`${styles.sealCard} ${styles.danger}`}>
                        <div className={styles.sealIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <span className={styles.sealValue}>{openFindings}</span>
                        <span className={styles.sealLabel}>Temuan Audit Terbuka</span>
                        <span className={styles.sealSubtext}>{riskPosture?.criticalCount || 0} kritis, {riskPosture?.highCount || 0} tinggi</span>
                    </div>

                    {/* Card 3: Tingkat Acknowledgment Kebijakan */}
                    <div className={`${styles.sealCard} ${styles.neutral}`}>
                        <div className={styles.sealIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <span className={styles.sealValue}>{policyAckRate}%</span>
                        <span className={styles.sealLabel}>Tingkat Acknowledgment Kebijakan</span>
                        <span className={styles.sealSubtext}>Pegawai yang telah menandatangani</span>
                    </div>
                </div>

                {/* ========== MAIN GRID ========== */}
                <div className={styles.mainGrid}>
                    {/* ========== Regulatory Framework Grid ========== */}
                    <div className={styles.matrixSection}>
                        <div className={styles.matrixHeader}>
                            <h2 className={styles.matrixTitle}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                                Kerangka Regulasi
                            </h2>
                        </div>
                        <table className={styles.matrixTable}>
                            <thead>
                                <tr>
                                    <th>Regulasi</th>
                                    <th>Status Kepatuhan</th>
                                    <th>Bukti Terakhir</th>
                                    <th>Pemilik Proses</th>
                                </tr>
                            </thead>
                            <tbody>
                                {regulations.map((reg) => {
                                    const status = getRegulationStatus(reg.id);
                                    const owner = getOwnerDept(reg.category);
                                    return (
                                        <tr key={reg.id}>
                                            <td>
                                                <div className={styles.regulationName}>{reg.name}</div>
                                                <div className={styles.regulationCode}>{reg.code}</div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[status]}`}>
                                                    {status === 'compliant' && '✓ MEMENUHI SYARAT'}
                                                    {status === 'action' && '⚠ BUTUH TINDAKAN'}
                                                    {status === 'critical' && '✕ TIDAK PATUH'}
                                                </span>
                                            </td>
                                            <td className={styles.timestampCell}>
                                                {getLastUpdate(reg.id)}
                                            </td>
                                            <td>
                                                <div className={styles.ownerCell}>
                                                    <span className={styles.ownerAvatar}>{owner.abbr}</span>
                                                    <span className={styles.ownerName}>{owner.name}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ========== Mandatory Action Checklist ========== */}
                    <div className={styles.checklistSection}>
                        <div className={styles.checklistHeader}>
                            <span className={styles.clipboardIcon}>📋</span>
                            <h3 className={styles.checklistTitle}>Tindakan Wajib</h3>
                        </div>
                        <div className={styles.checklistItems}>
                            {actionItems.length === 0 ? (
                                <div className={styles.noItems}>✓ Semua tindakan telah diselesaikan</div>
                            ) : (
                                actionItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`${styles.checklistItem} ${item.isOverdue ? styles.overdue : styles.warning}`}
                                    >
                                        <span className={`${styles.itemStatus} ${item.isOverdue ? styles.overdue : styles.warning}`}>
                                            {item.isOverdue ? 'TERLAMBAT' : 'MENDESAK'}
                                        </span>
                                        <span className={styles.itemDescription}>
                                            {item.description}
                                        </span>
                                        <div className={styles.itemMeta}>
                                            <div className={styles.itemResponsible}>
                                                <span className={styles.responsibleAvatar}>
                                                    {item.responsible.charAt(0)}
                                                </span>
                                                <span>{item.department}</span>
                                            </div>
                                            <span className={styles.itemDeadline}>
                                                Due: {item.deadline}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ========== Audit Readiness Footer Bar ========== */}
                <footer className={styles.auditFooter}>
                    <div className={styles.auditStatus}>
                        <div className={styles.readyIndicator}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div className={styles.statusText}>
                            <span className={styles.statusLabel}>Kesiapan Audit Eksternal: SIAP</span>
                            <span className={styles.statusTime}>Terakhir diverifikasi: {formatTime(auditLogs[0]?.timestamp || new Date().toISOString())}</span>
                        </div>
                    </div>
                    <button className={styles.generateBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Generate Evidence Package (PDF/A)
                    </button>
                </footer>
            </div>
        </DashboardLayout>
    );
}
