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
    timestamp: string;
    user: { name: string } | null;
}

// Compliance regulations
const regulations = [
    { id: '1', name: 'Undang-Undang Kearsipan', code: 'UU No. 43/2009', category: 'LEGAL' },
    { id: '2', name: 'Sistem Pemerintahan Berbasis Elektronik', code: 'Perpres 95/2018', category: 'LEGAL' },
    { id: '3', name: 'Information Security Management', code: 'ISO 27001', category: 'STANDARD' },
    { id: '4', name: 'Manajemen Risiko Instansi', code: 'PP 60/2008', category: 'LEGAL' },
    { id: '5', name: 'Pengamanan Informasi Pemerintah', code: 'Permen 59/2020', category: 'REGULATION' },
];

export default function ComplianceDashboard() {
    const [riskPosture, setRiskPosture] = useState<RiskPosture | null>(null);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [riskRes, violationsRes, auditRes] = await Promise.all([
                    fetch('/api/risk-posture'),
                    fetch('/api/violations?limit=10'),
                    fetch('/api/audit?limit=5'),
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
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const complianceIndex = riskPosture ? (100 - riskPosture.complianceRisk).toFixed(1) : '87.8';
    const openFindings = riskPosture ? (riskPosture.criticalCount + riskPosture.highCount) : 5;
    const policyAckRate = 94.2;

    const getRegulationStatus = (regId: string) => {
        const idx = parseInt(regId);
        if (idx === 2 || idx === 5) return 'action';
        return 'compliant';
    };

    const getOwner = (category: string) => {
        const map: Record<string, { name: string; abbr: string }> = {
            'LEGAL': { name: 'Biro Hukum', abbr: 'BH' },
            'STANDARD': { name: 'Unit IT Security', abbr: 'IT' },
            'REGULATION': { name: 'Unit Kepatuhan', abbr: 'UK' },
        };
        return map[category] || { name: 'Unit Umum', abbr: 'UU' };
    };

    const formatTime = (dateStr: string) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const actionItems = violations.slice(0, 4).map(v => {
        const hoursAgo = Math.floor((Date.now() - new Date(v.timestamp).getTime()) / 3600000);
        return {
            id: v.id,
            desc: v.policy?.name || 'Policy review required',
            owner: v.user?.name?.split(' ')[0] || 'Admin',
            dept: v.user?.department || 'IT',
            deadline: hoursAgo > 24 ? 'Overdue' : 'Due today',
            isOverdue: hoursAgo > 24,
        };
    });

    if (loading) {
        return (
            <DashboardLayout title="Compliance Center" subtitle="Loading...">
                <div className={styles.container}>
                    <div className={styles.loading}>Loading compliance data...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Compliance Center"
            subtitle="Regulatory Compliance & Audit Dashboard"
        >
            <div className={styles.container}>
                {/* ========== HERO METRICS ========== */}
                <div className={styles.heroSection}>
                    {/* Compliance Rate - Gold Accent */}
                    <div className={`${styles.heroCard} ${styles.gold}`}>
                        <div className={styles.heroIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <span className={styles.heroLabel}>C O M P L I A N C E &nbsp; R A T E</span>
                        <span className={styles.heroValue}>{complianceIndex}%</span>
                        <span className={styles.heroSubtext}>Regulatory compliance index</span>
                    </div>

                    {/* Open Findings - Cyan */}
                    <div className={`${styles.heroCard} ${styles.cyan}`}>
                        <div className={styles.heroIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <span className={styles.heroLabel}>O P E N &nbsp; F I N D I N G S</span>
                        <span className={styles.heroValue}>{openFindings}</span>
                        <span className={styles.heroSubtext}>{riskPosture?.criticalCount || 0} critical, {riskPosture?.highCount || 0} high priority</span>
                    </div>

                    {/* Policy Acknowledgment - White */}
                    <div className={`${styles.heroCard} ${styles.white}`}>
                        <div className={styles.heroIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <polyline points="9 15 11 17 15 13" />
                            </svg>
                        </div>
                        <span className={styles.heroLabel}>P O L I C Y &nbsp; A C K</span>
                        <span className={styles.heroValue}>{policyAckRate}%</span>
                        <span className={styles.heroSubtext}>Staff acknowledgment rate</span>
                    </div>
                </div>

                {/* ========== MAIN GRID ========== */}
                <div className={styles.mainGrid}>
                    {/* Regulatory Matrix */}
                    <div className={styles.glassPanel}>
                        <div className={styles.panelHeader}>
                            <h2 className={styles.panelTitle}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="9" y1="21" x2="9" y2="9" />
                                </svg>
                                Regulatory Framework
                            </h2>
                        </div>

                        <div className={styles.floatingTable}>
                            <div className={styles.tableHeader}>
                                <span>Regulation</span>
                                <span>Status</span>
                                <span>Last Updated</span>
                                <span>Owner</span>
                            </div>
                            <div className={styles.tableBody}>
                                {regulations.map((reg) => {
                                    const status = getRegulationStatus(reg.id);
                                    const owner = getOwner(reg.category);
                                    return (
                                        <div key={reg.id} className={styles.tableRow}>
                                            <div className={styles.regulationCell}>
                                                <span className={styles.regulationName}>{reg.name}</span>
                                                <span className={styles.regulationCode}>{reg.code}</span>
                                            </div>
                                            <div>
                                                <span className={`${styles.pillBadge} ${styles[status]}`}>
                                                    {status === 'compliant' ? 'Verified' : 'Action Required'}
                                                </span>
                                            </div>
                                            <span className={styles.timestampCell}>
                                                {formatTime(auditLogs[0]?.timestamp || new Date().toISOString())}
                                            </span>
                                            <div className={styles.ownerCell}>
                                                <span className={styles.ownerAvatar}>{owner.abbr}</span>
                                                <span className={styles.ownerName}>{owner.name}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className={styles.glassPanel}>
                        <div className={styles.panelHeader}>
                            <h2 className={styles.panelTitle}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                Pending Actions
                            </h2>
                        </div>

                        <div className={styles.actionsFeed}>
                            {actionItems.length === 0 ? (
                                <div className={styles.noActions}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    <span className={styles.noActionsText}>All actions completed</span>
                                </div>
                            ) : (
                                actionItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`${styles.actionItem} ${item.isOverdue ? styles.overdue : styles.warning}`}
                                    >
                                        <span className={styles.actionLabel}>
                                            {item.isOverdue ? 'Overdue' : 'Due Soon'}
                                        </span>
                                        <span className={styles.actionDesc}>{item.desc}</span>
                                        <div className={styles.actionMeta}>
                                            <div className={styles.actionOwner}>
                                                <span className={styles.miniAvatar}>{item.owner.charAt(0)}</span>
                                                <span>{item.dept}</span>
                                            </div>
                                            <span>{item.deadline}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ========== EVIDENCE BAR ========== */}
                <div className={styles.evidenceBar}>
                    <div className={styles.evidenceStatus}>
                        <div className={styles.statusIndicator} />
                        <div className={styles.statusInfo}>
                            <span className={styles.statusLabel}>Audit Ready</span>
                            <span className={styles.statusTime}>
                                Last verified: {formatTime(auditLogs[0]?.timestamp || new Date().toISOString())}
                            </span>
                        </div>
                    </div>
                    <button className={styles.evidenceBtn}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Generate Evidence Package
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
